package com.lrplatform.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lrplatform.annotation.Auditable;
import com.lrplatform.model.entity.User;
import com.lrplatform.repository.UserRepository;
import com.lrplatform.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;
import java.util.Optional;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditAspect {

    private final AuditLogService auditLogService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Around("@annotation(com.lrplatform.annotation.Auditable)")
    public Object audit(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        Auditable auditable = method.getAnnotation(Auditable.class);

        HttpServletRequest request = getRequest();
        User user = getCurrentUser();

        String oldValue = null;
        Object result = null;
        boolean success = true;

        try {
            result = joinPoint.proceed();
            return result;
        } catch (Throwable ex) {
            success = false;
            throw ex;
        } finally {
            try {
                String newValue = result != null ? objectMapper.writeValueAsString(result) : null;
                Long entityId = extractEntityId(result, joinPoint.getArgs());

                if (success) {
                    auditLogService.log(user, auditable.module(), auditable.action(),
                            auditable.entityType(), entityId, oldValue, newValue, request);
                } else {
                    auditLogService.logFailure(user, auditable.module(), auditable.action(),
                            auditable.entityType(), entityId, "Operation failed", request);
                }
            } catch (Exception e) {
                log.warn("Failed to create audit log: {}", e.getMessage());
            }
        }
    }

    private HttpServletRequest getRequest() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attrs != null ? attrs.getRequest() : null;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        String email = auth.getName();
        return userRepository.findByEmail(email).orElse(null);
    }

    private Long extractEntityId(Object result, Object[] args) {
        if (result == null) return null;
        try {
            if (result instanceof Optional) {
                result = ((Optional<?>) result).orElse(null);
            }
            if (result == null) return null;

            var idMethod = result.getClass().getMethod("getId");
            Object id = idMethod.invoke(result);
            if (id instanceof Long) return (Long) id;
        } catch (Exception ignored) {}

        for (Object arg : args) {
            if (arg instanceof Long) return (Long) arg;
        }
        return null;
    }
}
