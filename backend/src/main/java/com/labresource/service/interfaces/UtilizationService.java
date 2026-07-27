package com.labresource.service.interfaces;

import com.labresource.dto.response.DemandAnalysisResponse;
import com.labresource.dto.response.EquipmentUtilizationResponse;
import com.labresource.dto.response.HeatmapCellResponse;
import com.labresource.dto.response.IdleEquipmentResponse;
import com.labresource.dto.response.PeakUsageResponse;
import com.labresource.dto.response.UtilizationSummaryResponse;

import java.util.List;

public interface UtilizationService {

    EquipmentUtilizationResponse getEquipmentUtilization(Long equipmentId, int days);

    UtilizationSummaryResponse getSummary(int days);

    List<HeatmapCellResponse> getHeatmap(int days, Long equipmentId);

    List<IdleEquipmentResponse> getIdleEquipment(int idleDays);

    /**
     * Peak usage pattern analysis: busiest/quietest hours and days, how concentrated demand is,
     * and which slots to steer flexible work into. Optionally scoped to one equipment item.
     */
    PeakUsageResponse getPeakUsage(int days, Long equipmentId);

    /**
     * Sets (or, with a null target, clears) a department's utilization target.
     * @return the applied target, or null when cleared
     */
    Double setDepartmentTarget(Long departmentId, Double targetPercent);

    /** Sets (or, with a null target, clears) an institution's utilization target. */
    Double setInstitutionTarget(Long institutionId, Double targetPercent);

    /**
     * Demand analysis: what people asked for versus what capacity existed, and how much
     * had to be turned away. Distinct from utilization, which only sees granted bookings.
     */
    DemandAnalysisResponse getDemandAnalysis(int days);
}
