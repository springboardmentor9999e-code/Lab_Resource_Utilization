package com.lrplatform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceScheduleResponse {
    private Long equipmentId;
    private String equipmentName;
    private String equipmentCode;
    private String manufacturer;
    private String modelNumber;
    private String serialNumber;
    private String laboratoryName;
    private String departmentName;
    private String institutionName;
    private LocalDate lastServiceDate;
    private LocalDate nextServiceDueDate;
    private Integer serviceIntervalMonths;
    private long serviceCount;
    private String status;
    private long daysUntilDue;
}
