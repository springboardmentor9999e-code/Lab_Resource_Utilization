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
 * API Gateway rate limiting — an in-memory token bucket per caller, in two tiers.
 *
 * <p>/api/auth/** gets a much smaller bucket: those endpoints are unauthenticated and worth
 * brute-forcing. Everything else gets a bucket sized for normal dashboard use, where one page
 * load legitimately fires several parallel requests.
 *
 * <p>Keyed by client IP, not username, because this runs before {@link JwtAuthenticationFilter}
 * — a flood carrying no valid token is rejected before it costs any JWT parsing or DB lookups.
 * Buckets are per-instance; multiple replicas would need them moved to Redis.
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

    /** Drops idle buckets. Driven by a request counter so an idle server does no work at all. */
    private void sweepIfDue() {
        if (++requestsSinceSweep < EVICTION_SWEEP_EVERY) {
            return;
        }
        requestsSinceSweep = 0;
        long cutoff = System.currentTimeMillis() - IDLE_EVICTION_MS;
        buckets.entrySet().removeIf(e -> e.getValue().lastSeen() < cutoff);
    }

    /**
     * Token bucket refilling continuously at {@code limit} tokens per minute. Continuous refill
     * avoids the fixed-window burst where a caller spends a full budget at 0:59 and again at 1:01.
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
