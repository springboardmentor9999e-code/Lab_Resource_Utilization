package com.rems.dto;

import com.rems.entity.Department;
import com.rems.entity.Institution;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipmentRequest {
    private Long institutionId;
    private Long departmentId;
    private Long labId;
    private String name;
    private String category;
    private String model;
    private String serialNumber;
    private String manufacturer;
    private LocalDate purchaseDate;
    private LocalDate expiryDate;
    private BigDecimal purchaseCost;
    private Integer amount;
    private String imageUrl;
    private BigDecimal cost;
    private String location;
    private String status;
    private String description;
    private String manual;
}
