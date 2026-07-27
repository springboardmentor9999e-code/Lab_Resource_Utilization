package com.labresource.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class EquipmentRequest {

    @NotBlank(message = "Equipment name is required")
    private String equipmentName;

    @NotBlank(message = "Equipment code is required")
    private String equipmentCode;

    @NotBlank(message = "Category is required")
    private String category;

    private String manufacturer;

    private String model;

    private String serialNumber;

    private LocalDate purchaseDate;

    private String status; // AVAILABLE, IN_USE, RESERVED, UNDER_MAINTENANCE, OUT_OF_SERVICE, LOST

    private LocalDate warrantyExpiry;

    private String vendor;

    private BigDecimal cost;

    private String currentLocation;

    private String description;

    // JSON string of key/value specification pairs
    private String specifications;

    private String rfidTag;

    // Comma-separated free-form tags for cataloging/search (e.g. "high-voltage,shared")
    private String tags;

    // Whether this equipment is listed for inter-institution sharing
    private Boolean isShareable;

    // Usage fee per hour for shared access (optional)
    private java.math.BigDecimal hourlyRate;

    private Long labId; // Can be null if not allocated

    private Long departmentId;

    private Long institutionId;
}
