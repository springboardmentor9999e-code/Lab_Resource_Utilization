package com.labresource.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * API Gateway rate limiting (spec: API Gateway &amp; Security Layer).
 *
 * A token bucket per caller, held in memory. Two tiers, because the threat models differ:
 *
 *   AUTH tier  (/api/auth/**)  — small bucket. These endpoints are unauthenticated and are the
 *                               ones worth brute-forcing (login, OTP verification), so they get a
 *                               much tighter budget than the rest of the API.
 *   API tier   (everything else) — larger bucket sized for normal dashboard use, where a single
 *                               page load legitimately fires a handful of parallel requests.
 *
 * Callers are keyed by client IP rather than username: this filter deliberately runs BEFORE
 * {@link JwtAuthenticationFilter}, so that a flood of requests carrying no (or a bogus) token is
 * rejected before it costs us any JWT parsing or database lookups.
 *
 * In-memory means the budget is per-instance and resets on restart. That is the right trade for a
 * single-node deployment; running several replicas behind a load balancer would want the buckets
 * moved into the Redis instance the architecture already specifies.
 */
@Component
@Order(2) // immediately after RequestLoggingFilter, and ahead of the Spring Security chain
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    /** Buckets idle for longer than this are evicted so the map cannot grow without bound. */
    private static final long IDLE_EVICTION_MS = 10 * 60 * 1000L;
    private static final int EVICTION_SWEEP_EVERY = 500;

    @Value("${app.ratelimit.enabled:true}")
    private boolean enabled;

    @Value("${app.ratelimit.auth-requests-per-minute:20}")
    private int authRequestsPerMinute;

    @Value("${app.ratelimit.api-requests-per-minute:200}")
    private int apiRequestsPerMinute;

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
    private int requestsSinceSweep = 0;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // Static upload serving and CORS preflight are not worth metering
        return !enabled
                || "OPTIONS".equalsIgnoreCase(request.getMethod())
                || request.getServletPath().startsWith("/uploads/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        boolean authTier = request.getServletPath().startsWith("/api/auth/");
        int limit = authTier ? authRequestsPerMinute : apiRequestsPerMinute;
        String key = (authTier ? "auth:" : "api:") + clientIp(request);

        Bucket bucket = buckets.computeIfAbsent(key, k -> new Bucket(limit));
        long retryAfterMs = bucket.tryConsume(limit);

        sweepIfDue();

        if (retryAfterMs > 0) {
            long retryAfterSeconds = Math.max(1, retryAfterMs / 1000);
            log.warn("Rate limit exceeded for {} on {} {}",
                    key, request.getMethod(), request.getServletPath());

            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
            response.getWriter().write(
                    "{\"success\":false,\"message\":\"Too many requests — please slow down and retry in "
                            + retryAfterSeconds + " second(s).\",\"data\":null}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    /** Honours X-Forwarded-For so the limit follows the real client when behind Nginx. */
    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            // May be a chain "client, proxy1, proxy2" — the first entry is the originating client
            int comma = forwarded.indexOf(',');
            return (comma > 0 ? forwarded.substring(0, comma) : forwarded).trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }

    /**
     * Drops buckets nobody has touched recently. Run on a request counter rather than a scheduled
     * task so an idle server does no work at all.
     */
    private void sweepIfDue() {
        if (++requestsSinceSweep < EVICTION_SWEEP_EVERY) {
            return;
        }
        requestsSinceSweep = 0;
        long cutoff = System.currentTimeMillis() - IDLE_EVICTION_MS;
        buckets.entrySet().removeIf(e -> e.getValue().lastSeen() < cutoff);
    }

    /**
     * Token bucket refilling continuously at {@code limit} tokens per minute.
     * Continuous refill (rather than a fixed window) avoids the burst-at-the-boundary problem
     * where a caller spends a full window's budget at 0:59 and another at 1:01.
     */
    private static final class Bucket {
        private double tokens;
        private long lastRefillMs;
        private long lastSeenMs;

        Bucket(int limit) {
            this.tokens = limit;
            this.lastRefillMs = System.currentTimeMillis();
            this.lastSeenMs = this.lastRefillMs;
        }

        /**
         * @return 0 if the request is allowed, otherwise the milliseconds until one token is free
         */
        synchronized long tryConsume(int limit) {
            long now = System.currentTimeMillis();
            lastSeenMs = now;

            double refillPerMs = limit / 60000.0;
            tokens = Math.min(limit, tokens + (now - lastRefillMs) * refillPerMs);
            lastRefillMs = now;

            if (tokens >= 1.0) {
                tokens -= 1.0;
                return 0;
            }
            return (long) Math.ceil((1.0 - tokens) / refillPerMs);
        }

        synchronized long lastSeen() {
            return lastSeenMs;
        }
    }
}
