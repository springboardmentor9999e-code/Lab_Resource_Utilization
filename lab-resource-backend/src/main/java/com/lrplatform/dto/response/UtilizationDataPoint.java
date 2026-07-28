package com.lrplatform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UtilizationDataPoint {
    private String label;
    private double utilizationPercent;
    private long totalHours;
    private long usedHours;
}
