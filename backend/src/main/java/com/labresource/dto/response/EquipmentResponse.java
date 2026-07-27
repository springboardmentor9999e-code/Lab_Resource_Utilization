package com.labresource.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class EquipmentResponse {
    private Long equipmentId;
    private String equipmentName;
    private String equipmentCode;
    private String category;
    private String manufacturer;
    private String model;
    private String serialNumber;
    private LocalDate purchaseDate;
    private String status;
    private LocalDate warrantyExpiry;
    private String vendor;
    private BigDecimal cost;
    private String currentLocation;
    private String description;
    private String specifications;
    private String qrCode;
    private String rfidTag;

    private String tags;
    private Boolean isShareable;
    private java.math.BigDecimal hourlyRate;
    private Long labId;
    private String labName;
    private Long departmentId;
    private String departmentName;
    private Long institutionId;
    private String institutionName;
    private String primaryImageUrl;
    private List<EquipmentImageResponse> images;
    private List<EquipmentDocumentResponse> documents;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
