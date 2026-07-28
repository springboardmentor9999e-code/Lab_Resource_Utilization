package com.lrplatform.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CostAllocationRequest {
    private Long departmentId;
    private Long institutionId;
    private LocalDate dateFrom;
    private LocalDate dateTo;
}
