package com.labresource.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SharedEquipmentResponse {

    private Long equipmentId;
    private String name;
    private String code;
    private String category;
    private String manufacturer;
    private String model;
    private String status;

    private Long institutionId;
    private String institutionName;
    private String departmentName;
    private String labName;

    private String primaryImageUrl;

    // Usage fee per hour for shared access (null/0 = free)
    private java.math.BigDecimal hourlyRate;
}
