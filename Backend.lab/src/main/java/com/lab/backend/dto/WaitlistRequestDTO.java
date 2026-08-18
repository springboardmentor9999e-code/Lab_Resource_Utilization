package com.lab.backend.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WaitlistRequestDTO {
    private Long resourceId;
    private Long userId;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer priority;
}
