package com.labhub.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HeatmapResponse {
    private String category; // e.g. Day, Department, Equipment
    private String timePeriod; // e.g. Mon, Tue, Jan, Feb
    private double utilizationPercentage;
}
