package com.rems.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingRequest {

    @NotNull(message = "equipmentId is required")
    private Long equipmentId;

    @NotNull(message = "startTime is required")
    private Instant startTime;

    @NotNull(message = "endTime is required")
    private Instant endTime;

    private String purpose;
}
