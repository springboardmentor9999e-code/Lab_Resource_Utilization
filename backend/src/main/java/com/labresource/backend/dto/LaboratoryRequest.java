package com.labresource.backend.dto;

import lombok.Data;

@Data
public class LaboratoryRequest {

    private String labName;

    private String labCode;

    private String location;

    private Integer capacity;

    private String status;
}