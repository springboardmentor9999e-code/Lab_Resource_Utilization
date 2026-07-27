package com.labresource.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class EquipmentImageResponse {
    private Long imageId;
    private String imageUrl;
    private String fileName;
    private Boolean isPrimary;
    private String uploadedBy;
    private LocalDateTime uploadedAt;
}
