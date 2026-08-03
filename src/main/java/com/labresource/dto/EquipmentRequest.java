package com.labresource.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EquipmentRequest {
    private String name;
    private String category;
    private Long institutionId;
    private String description;
    private String imageBase64;
    private Double cost;
}