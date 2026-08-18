package com.lab.backend.dto;

import lombok.*;
import com.lab.backend.enums.WaitlistStatus;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WaitlistResponseDTO {
    private Long id;
    private Long resourceId;
    private Long userId;
    private LocalDate desiredStartDate;
    private LocalDate desiredEndDate;
    private Integer positionInQueue;
    private WaitlistStatus status;
    private Integer priority;
}
