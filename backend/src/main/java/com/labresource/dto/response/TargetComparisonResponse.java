package com.labresource.dto.response;

import lombok.Builder;
import lombok.Data;

/**
 * Actual utilization measured against the target set for a department or institution
 * (spec: Utilization Dimension "Department vs. Institutional Targets").
 */
@Data
@Builder
public class TargetComparisonResponse {

    private Long id;
    private String name;
    /** DEPARTMENT or INSTITUTION. */
    private String scope;

    private double actualPercent;
    private double targetPercent;

    /** actual - target. Negative means under target. */
    private double variancePercent;

    /** How the target was resolved: OWN, INHERITED (from the institution), or DEFAULT. */
    private String targetSource;

    /** BELOW | ON_TRACK | ABOVE — ON_TRACK allows a tolerance band around the target. */
    private String status;

    /** Equipment counted towards this figure — a target over 2 assets means little. */
    private int equipmentCount;
}
