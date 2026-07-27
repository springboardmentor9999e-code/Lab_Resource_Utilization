package com.labresource.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class EquipmentDocumentResponse {
    private Long documentId;
    private String documentType;
    private String title;
    private String fileUrl;
    private String fileName;
    private Long fileSize;
    private String uploadedBy;
    private LocalDateTime uploadedAt;
}
