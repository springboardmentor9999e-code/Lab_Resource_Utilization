package com.lrplatform.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnouncementRequest {
    private String title;
    private String content;
    private String announcementType;
    private String priority;
    private String targetAudience;
    private Long institutionId;
    private Long departmentId;
    private Boolean published;
    private LocalDateTime expiresAt;
}
