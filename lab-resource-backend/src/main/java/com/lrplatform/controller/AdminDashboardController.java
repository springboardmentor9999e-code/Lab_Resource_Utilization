package com.lrplatform.controller;

import com.lrplatform.dto.response.AdminDashboardStats;
import com.lrplatform.dto.response.AuditLogResponse;
import com.lrplatform.model.entity.AuditLog;
import com.lrplatform.model.entity.User;
import com.lrplatform.repository.AuditLogRepository;
import com.lrplatform.security.CurrentUserUtil;
import com.lrplatform.service.AdminDashboardService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN')")
@Slf4j
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;
    private final AuditLogRepository auditLogRepository;
    private final CurrentUserUtil currentUserUtil;

    @GetMapping("/stats")
    public ResponseEntity<AdminDashboardStats> getStats(HttpServletRequest httpRequest) {
        User currentUser = currentUserUtil.getCurrentUser(httpRequest);
        if (currentUser.getRole().name().equals("INSTITUTION_ADMIN")) {
            Long institutionId = currentUser.getInstitution() != null ? currentUser.getInstitution().getId() : null;
            if (institutionId != null) {
                return ResponseEntity.ok(adminDashboardService.getDashboardStatsByInstitution(institutionId));
            }
        }
        return ResponseEntity.ok(adminDashboardService.getDashboardStats());
    }

    @GetMapping("/recent-activity")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<List<AuditLogResponse>> getRecentActivity() {
        List<AuditLog> recentLogs = auditLogRepository.findTop20ByOrderByActionTimeDesc();
        List<AuditLogResponse> dtos = recentLogs.stream().map(this::toDto).toList();
        return ResponseEntity.ok(dtos);
    }

    private AuditLogResponse toDto(AuditLog a) {
        return AuditLogResponse.builder()
                .id(a.getId())
                .userId(a.getUser() != null ? a.getUser().getId() : null)
                .userFullName(a.getUser() != null ? a.getUser().getFirstName() + " " + a.getUser().getLastName() : "System")
                .userEmail(a.getUser() != null ? a.getUser().getEmail() : null)
                .module(a.getModule())
                .action(a.getAction())
                .entityType(a.getEntityType())
                .entityId(a.getEntityId())
                .ipAddress(a.getIpAddress())
                .result(a.getResult())
                .actionTime(a.getActionTime())
                .build();
    }
}
