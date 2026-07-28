package com.lrplatform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogResponse {
    private Long id;
    private Long userId;
    private String userFullName;
    private String userEmail;
    private String module;
    private String action;
    private String entityType;
    private Long entityId;
    private String ipAddress;
    private String result;
    private LocalDateTime actionTime;
}
