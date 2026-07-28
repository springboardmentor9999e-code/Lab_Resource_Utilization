package com.lrplatform.controller;

import com.lrplatform.dto.response.AuditLogResponse;
import com.lrplatform.model.entity.AuditLog;
import com.lrplatform.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SYSTEM_ADMIN')")
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    public ResponseEntity<List<AuditLogResponse>> getAll() {
        List<AuditLog> logs = auditLogRepository.findTop20ByOrderByActionTimeDesc();
        return ResponseEntity.ok(logs.stream().map(this::toDto).toList());
    }

    @GetMapping("/page")
    public ResponseEntity<Page<AuditLogResponse>> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo,
            @RequestParam(required = false) String userSearch) {

        LocalDateTime from = parseDate(dateFrom);
        LocalDateTime to = parseDate(dateTo);

        Page<AuditLog> result;
        if (module != null && !module.isEmpty()) {
            result = auditLogRepository.findFilteredByModule(module, from, to, userSearch, PageRequest.of(page, size));
        } else {
            result = auditLogRepository.findFiltered(from, to, userSearch, PageRequest.of(page, size));
        }

        return ResponseEntity.ok(result.map(this::toDto));
    }

    @GetMapping("/module/{module}")
    public ResponseEntity<List<AuditLogResponse>> getByModule(@PathVariable String module) {
        List<AuditLog> logs = auditLogRepository.findByModuleOrderByActionTimeDesc(module);
        return ResponseEntity.ok(logs.stream().map(this::toDto).toList());
    }

    private LocalDateTime parseDate(String dateStr) {
        if (dateStr == null || dateStr.isEmpty()) return null;
        try {
            return LocalDateTime.parse(dateStr + "T00:00:00", DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        } catch (Exception e) {
            try {
                return LocalDateTime.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            } catch (Exception ex) {
                return null;
            }
        }
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
