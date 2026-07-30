package com.labhub.controller;

import com.labhub.dto.common.ApiResponse;
import com.labhub.entity.AuditLog;
import com.labhub.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAuditLogs() {
        List<AuditLog> logs = auditLogService.getAllAuditLogs();
        List<Map<String, Object>> result = logs.stream().map(l -> Map.<String, Object>of(
                "id", l.getId().toString(),
                "userEmail", l.getUser() != null ? l.getUser().getEmail() : "SYSTEM",
                "userName", l.getUser() != null ? l.getUser().getFullName() : "SYSTEM",
                "action", l.getAction(),
                "entityName", l.getEntityName() != null ? l.getEntityName() : "",
                "entityId", l.getEntityId() != null ? l.getEntityId() : "",
                "details", l.getDetails() != null ? l.getDetails() : "",
                "timestamp", l.getTimestamp().toString()
        )).toList();
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
