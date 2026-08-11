package com.lrplatform.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class RateLimitInterceptor implements HandlerInterceptor {

    @Value("${rate-limit.enabled:true}")
    private boolean enabled;

    @Value("${rate-limit.requests-per-minute:60}")
    private int requestsPerMinute;

    @Value("${rate-limit.requests-per-hour:1000}")
    private int requestsPerHour;

    @Value("${rate-limit.trusted-proxies:}")
    private String trustedProxies;

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request,
                             @NonNull HttpServletResponse response,
                             @NonNull Object handler) throws Exception {
        if (!enabled) {
            return true;
        }

        String clientIp = getClientIp(request);

        if (isRateLimited(clientIp, "minute", requestsPerMinute, 60_000) ||
            isRateLimited(clientIp, "hour", requestsPerHour, 3_600_000)) {
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

    private boolean isRateLimited(String clientIp, String windowName,
                                   int maxRequests, long windowMs) {
        long now = System.currentTimeMillis();
        String key = "ratelimit:" + windowName + ":" + clientIp;
        
        try {
            // Remove expired entries
            redisTemplate.opsForZSet().removeRangeByScore(key, 0, now - windowMs);
            
            // Check current count
            Long count = redisTemplate.opsForZSet().zCard(key);
            
            if (count != null && count >= maxRequests) {
                return true;
            }
            
            // Add current request
            redisTemplate.opsForZSet().add(key, UUID.randomUUID().toString(), now);
            // Set expiry on the whole key to automatically clean up
            redisTemplate.expire(key, java.time.Duration.ofMillis(windowMs));
            
            return false;
        } catch (Exception e) {
            // If Redis fails, log it and allow the request (fail open)
            return false;
        }
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
        int activeMinuteClients = 0;
        int activeHourClients = 0;
        
        try {
            var minuteKeys = redisTemplate.keys("ratelimit:minute:*");
            if (minuteKeys != null) activeMinuteClients = minuteKeys.size();
            
            var hourKeys = redisTemplate.keys("ratelimit:hour:*");
            if (hourKeys != null) activeHourClients = hourKeys.size();
        } catch (Exception e) {
            // Ignore Redis errors for metrics
        }

        return Map.of(
            "enabled", enabled,
            "requestsPerMinuteLimit", requestsPerMinute,
            "requestsPerHourLimit", requestsPerHour,
            "activeMinuteClients", activeMinuteClients,
            "activeHourClients", activeHourClients
        );
    }
}
