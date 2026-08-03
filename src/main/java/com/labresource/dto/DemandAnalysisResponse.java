package com.labresource.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class DemandAnalysisResponse {
    private List<HourlyDemand> hourly;
    private List<DayDemand> byDayOfWeek;
}
