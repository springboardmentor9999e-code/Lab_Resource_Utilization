package com.rems.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipmentResponse {
    private Long equipmentId;
    private Long institutionId;
    private String institutionName;
    private Long departmentId;
    private String departmentName;
    private Long labId;
    private String labName;
    private String name;
    private String category;
    private String model;
    private String serialNumber;
    private String manufacturer;
    private LocalDate purchaseDate;
    private BigDecimal purchaseCost;
    private Integer amount;
    private String imageUrl;
    private BigDecimal cost;
    private String location;
    private String status;
    private String description;
    private String manual;
    private Instant createdAt;
    private Instant updatedAt;
}
