package com.labresource.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class EquipmentHeatmapRow {
    private Long equipmentId;
    private String equipmentName;
    private List<Double> dailyHours; // aligned with HeatmapResponse.days, oldest to newest
}
