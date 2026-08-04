package com.labresource.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EquipmentRequest {

    private String equipmentName;

    private String category;

    private String description;

    private Double cost;

    private Integer quantity;

    private Integer availableQuantity;

    private String status;

    private String image;

    private Long labId;
}