package com.labresource.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class HeatmapResponse {
    private List<String> days; // e.g. "2026-07-15", oldest to newest, 7 entries
    private List<EquipmentHeatmapRow> rows;
}