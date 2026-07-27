package com.labresource.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LabResponse {
    private Long labId;
    private String name;
    private String code;
    private Integer capacity;
    private String location;
    private Long departmentId;
    private String departmentName;
    private Long equipmentCount;
    private Boolean isActive;
}
