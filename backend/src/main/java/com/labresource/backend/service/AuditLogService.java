package com.labresource.backend.service;

import com.labresource.backend.entity.AuditLog;
import com.labresource.backend.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    // Get All Logs
    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAll();
    }

    // Get Log By ID
    public AuditLog getLogById(Long id) {

        return auditLogRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Audit Log not found"));
    }

    // Get Logs By User
    public List<AuditLog> getLogsByUser(Long userId) {

        return auditLogRepository.findByUserUserId(userId);
    }

    // Create Log
    public AuditLog createLog(AuditLog log) {

        log.setCreatedAt(LocalDateTime.now());

        return auditLogRepository.save(log);
    }

    // Delete Log
    public void deleteLog(Long id) {

        AuditLog log = getLogById(id);

        auditLogRepository.delete(log);
    }
}