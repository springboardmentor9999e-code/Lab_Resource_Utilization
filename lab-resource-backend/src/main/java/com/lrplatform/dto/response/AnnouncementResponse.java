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
public class AnnouncementResponse {
    private Long id;
    private String title;
    private String content;
    private String announcementType;
    private String priority;
    private String targetAudience;
    private Long institutionId;
    private String institutionName;
    private Long departmentId;
    private String departmentName;
    private Long createdBy;
    private String createdByName;
    private Boolean published;
    private LocalDateTime publishedAt;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
