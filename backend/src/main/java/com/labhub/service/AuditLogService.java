package com.labhub.service;

import com.labhub.entity.AuditLog;
import com.labhub.entity.User;

import java.util.List;

public interface AuditLogService {
    void log(User user, String action, String entityName, String entityId, String details);
    List<AuditLog> getAllAuditLogs();
}
