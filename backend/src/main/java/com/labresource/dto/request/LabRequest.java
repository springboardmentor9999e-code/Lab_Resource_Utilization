package com.labresource.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LabRequest {

    @NotBlank(message = "Lab name is required")
    private String name;

    @NotBlank(message = "Lab code is required")
    private String code;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    private String location;

    @NotNull(message = "Department ID is required")
    private Long departmentId;
}
