package com.lrplatform.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.concurrent.atomic.AtomicLong;

@Component
public class RequestMetricsInterceptor implements HandlerInterceptor {

    private static final String START_TIME_ATTR = "requestStartTime";

    private final AtomicLong totalRequests = new AtomicLong(0);
    private final AtomicLong totalLatencyMs = new AtomicLong(0);
    private final AtomicLong errorCount = new AtomicLong(0);
    private final AtomicLong errorLatencyMs = new AtomicLong(0);

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler) {
        request.setAttribute(START_TIME_ATTR, System.currentTimeMillis());
        return true;
    }

    @Override
    public void afterCompletion(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler, @Nullable Exception ex) {
        Long startTime = (Long) request.getAttribute(START_TIME_ATTR);
        if (startTime == null) return;

        long duration = System.currentTimeMillis() - startTime;
        totalRequests.incrementAndGet();
        totalLatencyMs.addAndGet(duration);

        int status = response.getStatus();
        if (status >= 400 || ex != null) {
            errorCount.incrementAndGet();
            errorLatencyMs.addAndGet(duration);
        }
    }

    public long getTotalRequests() {
        return totalRequests.get();
    }

    public long getAvgLatencyMs() {
        long total = totalRequests.get();
        return total == 0 ? 0 : totalLatencyMs.get() / total;
    }

    public long getErrorCount() {
        return errorCount.get();
    }

    public double getErrorRate() {
        long total = totalRequests.get();
        return total == 0 ? 0.0 : (double) errorCount.get() / total * 100.0;
    }

    public void reset() {
        totalRequests.set(0);
        totalLatencyMs.set(0);
        errorCount.set(0);
        errorLatencyMs.set(0);
    }
}
