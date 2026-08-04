package com.labresource.backend.controller;

import com.labresource.backend.entity.AuditLog;
import com.labresource.backend.service.AuditLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auditlogs")
@CrossOrigin(origins = "*")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    // Create Log
    @PostMapping
    public ResponseEntity<AuditLog> createLog(
            @RequestBody AuditLog log) {

        return ResponseEntity.ok(
                auditLogService.createLog(log)
        );
    }

    // Get All Logs
    @GetMapping
    public ResponseEntity<List<AuditLog>> getAllLogs() {

        return ResponseEntity.ok(
                auditLogService.getAllLogs()
        );
    }

    // Get Log By ID
    @GetMapping("/{id}")
    public ResponseEntity<AuditLog> getLogById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                auditLogService.getLogById(id)
        );
    }

    // Get Logs By User
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AuditLog>> getLogsByUser(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                auditLogService.getLogsByUser(userId)
        );
    }

    // Delete Log
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteLog(
            @PathVariable Long id) {

        auditLogService.deleteLog(id);

        return ResponseEntity.ok("Audit Log deleted successfully");
    }
}