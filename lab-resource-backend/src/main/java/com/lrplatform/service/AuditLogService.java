package com.lrplatform.service;

import com.lrplatform.model.entity.AuditLog;
import com.lrplatform.model.entity.User;
import com.lrplatform.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void log(User user, String module, String action, String entityType,
                    Long entityId, String oldValue, String newValue,
                    HttpServletRequest request) {
        AuditLog auditLog = AuditLog.builder()
                .user(user)
                .module(module)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .oldValue(oldValue)
                .newValue(newValue)
                .ipAddress(getClientIp(request))
                .userAgent(request != null ? request.getHeader("User-Agent") : null)
                .result("SUCCESS")
                .build();
        auditLogRepository.save(Objects.requireNonNull(auditLog));
    }

    @Transactional
    public void logFailure(User user, String module, String action, String entityType,
                           Long entityId, String reason, HttpServletRequest request) {
        AuditLog auditLog = AuditLog.builder()
                .user(user)
                .module(module)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .newValue(reason)
                .ipAddress(getClientIp(request))
                .userAgent(request != null ? request.getHeader("User-Agent") : null)
                .result("FAILURE")
                .build();
        auditLogRepository.save(Objects.requireNonNull(auditLog));
    }

    private String getClientIp(HttpServletRequest request) {
        if (request == null) return null;
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
