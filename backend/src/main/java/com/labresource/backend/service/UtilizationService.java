package com.labresource.backend.service;

import com.labresource.backend.dto.EquipmentUtilizationResponse;
import com.labresource.backend.dto.UtilizationResponse;
import com.labresource.backend.dto.InstitutionUtilizationResponse;
import java.util.List;
import com.labresource.backend.dto.IdleEquipmentResponse;
import com.labresource.backend.dto.UtilizationTrendResponse;
import com.labresource.backend.dto.PeakUsageResponse;
import com.labresource.backend.dto.DepartmentUtilizationResponse;
import com.labresource.backend.dto.UtilizationHeatmapResponse;

public interface UtilizationService {

    UtilizationResponse getUtilizationSummary();
    List<EquipmentUtilizationResponse> getEquipmentUtilization();
    List<InstitutionUtilizationResponse> getInstitutionUtilization();
    List<DepartmentUtilizationResponse> getDepartmentUtilization();
    List<PeakUsageResponse> getPeakUsageData();
    List<UtilizationHeatmapResponse> getUtilizationHeatmap();
    List<UtilizationTrendResponse> getUtilizationTrend();
    List<IdleEquipmentResponse> getIdleEquipment();
}