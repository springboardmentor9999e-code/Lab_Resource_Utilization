package com.lrplatform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipmentResponse {
    private Long id;
    private String equipmentCode;
    private String equipmentName;
    private Long categoryId;
    private String categoryName;
    private Long laboratoryId;
    private String laboratoryName;
    private String manufacturer;
    private String modelNumber;
    private String serialNumber;
    private LocalDate purchaseDate;
    private BigDecimal purchaseCost;
    private BigDecimal hourlyRate;
    private LocalDate warrantyExpiry;
    private String status;
    private String qrCode;
    private String imageUrl;
    private Integer maxBookingHours;
    private LocalDate calibrationDueDate;
    private Integer serviceIntervalMonths;
    private LocalDate lastServiceDate;
    private LocalDate nextServiceDueDate;
    private Integer calibrationIntervalMonths;
    private String description;
    private Long assignedTechnicianId;
    private Map<String, Object> specifications;
    private List<String> tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
