package com.lrplatform.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Arrays;
import java.util.Deque;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    @Value("${rate-limit.enabled:true}")
    private boolean enabled;

    @Value("${rate-limit.requests-per-minute:60}")
    private int requestsPerMinute;

    @Value("${rate-limit.requests-per-hour:1000}")
    private int requestsPerHour;

    @Value("${rate-limit.trusted-proxies:}")
    private String trustedProxies;

    private final Map<String, Deque<Long>> minuteWindow = new ConcurrentHashMap<>();
    private final Map<String, Deque<Long>> hourWindow = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request,
                             @NonNull HttpServletResponse response,
                             @NonNull Object handler) throws Exception {
        if (!enabled) {
            return true;
        }

        String clientIp = getClientIp(request);

        if (isRateLimited(clientIp, minuteWindow, requestsPerMinute, 60_000) ||
            isRateLimited(clientIp, hourWindow, requestsPerHour, 3_600_000)) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write(
                objectMapper.writeValueAsString(Map.of(
                    "success", false,
                    "message", "Rate limit exceeded. Please try again later."
                ))
            );
            return false;
        }

        return true;
    }

    private boolean isRateLimited(String clientIp, Map<String, Deque<Long>> window,
                                   int maxRequests, long windowMs) {
        long now = System.currentTimeMillis();
        Deque<Long> timestamps = window.computeIfAbsent(clientIp, k -> new ConcurrentLinkedDeque<>());

        // Remove expired entries
        while (!timestamps.isEmpty() && timestamps.peekFirst() < now - windowMs) {
            timestamps.pollFirst();
        }

        if (timestamps.size() >= maxRequests) {
            return true;
        }

        timestamps.addLast(now);
        return false;
    }

    private String getClientIp(HttpServletRequest request) {
        String remoteAddr = request.getRemoteAddr();
        if (trustedProxies != null && !trustedProxies.isBlank()) {
            List<String> trusted = Arrays.stream(trustedProxies.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
            if (trusted.contains(remoteAddr)) {
                String xForwardedFor = request.getHeader("X-Forwarded-For");
                if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                    return xForwardedFor.split(",")[0].trim();
                }
            }
        }
        return remoteAddr;
    }

    public Map<String, Object> getMetrics() {
        long now = System.currentTimeMillis();
        int activeMinuteClients = 0;
        int activeHourClients = 0;

        for (Deque<Long> queue : minuteWindow.values()) {
            while (!queue.isEmpty() && queue.peekFirst() < now - 60_000) {
                queue.pollFirst();
            }
            if (!queue.isEmpty()) activeMinuteClients++;
        }

        for (Deque<Long> queue : hourWindow.values()) {
            while (!queue.isEmpty() && queue.peekFirst() < now - 3_600_000) {
                queue.pollFirst();
            }
            if (!queue.isEmpty()) activeHourClients++;
        }

        return Map.of(
            "enabled", enabled,
            "requestsPerMinute", requestsPerMinute,
            "requestsPerHour", requestsPerHour,
            "activeMinuteClients", activeMinuteClients,
            "activeHourClients", activeHourClients
        );
    }
}
