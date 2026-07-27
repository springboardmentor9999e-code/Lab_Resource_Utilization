package com.labresource.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SharingRequestCreate {

    @NotNull(message = "Equipment ID is required")
    private Long equipmentId;

    @NotBlank(message = "Purpose is required")
    @Size(max = 500, message = "Purpose must be at most 500 characters")
    private String purpose;

    @NotNull(message = "Requested date is required")
    private LocalDate requestedDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;
}
