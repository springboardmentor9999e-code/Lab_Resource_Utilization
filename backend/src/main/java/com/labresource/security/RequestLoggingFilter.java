package com.labresource.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * API Gateway request logging (spec: API Gateway &amp; Security Layer).
 *
 * Emits one line per request: correlation id, method, path, status, duration and the resolved
 * caller. Runs outermost so the duration covers the whole chain — including time spent in the
 * rate limiter and JWT filter — and so rejected requests are logged too.
 *
 * The caller is read AFTER the chain completes, because {@link JwtAuthenticationFilter} populates
 * the SecurityContext downstream of this filter; reading it up front would log every request as
 * anonymous.
 *
 * A per-request id is placed on the SLF4J MDC as {@code requestId}, so any log line written while
 * handling a request can be tied back to it, and is returned to the client as {@code X-Request-Id}
 * to make a user-reported failure traceable in the logs.
 */
@Component
@Order(1)
@Slf4j
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final String REQUEST_ID_HEADER = "X-Request-Id";
    private static final String MDC_KEY = "requestId";

    /** Requests slower than this are logged at WARN so they stand out. */
    @Value("${app.logging.slow-request-ms:2000}")
    private long slowRequestMs;

    @Value("${app.logging.requests-enabled:true}")
    private boolean enabled;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // Static file serving is noise; it would swamp the API lines we actually care about
        return !enabled || request.getServletPath().startsWith("/uploads/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // Reuse an upstream correlation id when a proxy supplies one, so a single id spans hops
        String incoming = request.getHeader(REQUEST_ID_HEADER);
        String requestId = (incoming != null && !incoming.isBlank())
                ? incoming.trim()
                : UUID.randomUUID().toString().substring(0, 8);

        MDC.put(MDC_KEY, requestId);
        response.setHeader(REQUEST_ID_HEADER, requestId);

        long startNs = System.nanoTime();
        try {
            filterChain.doFilter(request, response);
        } finally {
            long tookMs = (System.nanoTime() - startNs) / 1_000_000;
            int status = response.getStatus();
            String query = request.getQueryString();
            String line = "{} {}{} -> {} ({} ms) user={} ip={}";
            Object[] args = {
                    request.getMethod(),
                    request.getServletPath(),
                    query == null ? "" : "?" + query,
                    status,
                    tookMs,
                    currentUsername(),
                    request.getRemoteAddr(),
            };

            if (status >= 500) {
                log.error(line, args);
            } else if (status >= 400 || tookMs >= slowRequestMs) {
                log.warn(line, args);
            } else {
                log.info(line, args);
            }

            MDC.remove(MDC_KEY);
        }
    }

    private String currentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return "anonymous";
        }
        String name = auth.getName();
        return (name == null || name.isBlank()) ? "anonymous" : name;
    }
}
