package com.lab.backend.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResourceSharingRequestDTO {
    private Long resourceId;
    private Long requestingInstId;
    private Long providerInstId;
    private String purpose;
    private LocalDate startDate;
    private LocalDate endDate;
}
