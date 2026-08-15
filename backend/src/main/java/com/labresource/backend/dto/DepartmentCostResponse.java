package com.labresource.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DepartmentCostResponse {

    private String departmentName;

    private Long totalBookings;

    private Double totalCost;

}