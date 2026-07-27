package com.labresource.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CalibrationCreate {

    @NotNull(message = "Equipment ID is required")
    private Long equipmentId;

    @NotNull(message = "Calibration date is required")
    private LocalDate calibrationDate;

    @NotNull(message = "Next due date is required")
    private LocalDate nextDueDate;

    @Size(max = 100)
    private String certificateNumber;

    @Size(max = 150)
    private String calibratedBy;

    @Size(max = 500)
    private String remarks;
}
