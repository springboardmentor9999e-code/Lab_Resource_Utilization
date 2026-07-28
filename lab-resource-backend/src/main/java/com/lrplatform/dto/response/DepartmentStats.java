package com.lrplatform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentStats {
    private Long departmentId;
    private String departmentName;
    private long equipmentCount;
    private long bookingCount;
    private long userCount;
    private double utilizationRate;
}
