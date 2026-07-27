package com.labresource.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Splits usage by how the equipment is made available and who actually consumed it
 * (spec: Utilization Dimension "Shared vs. Exclusive Usage Patterns").
 *
 * Two distinct questions are answered here, and conflating them is the usual mistake:
 *
 *  1. Inventory posture — how much of the catalogue is *listed* as shareable at all.
 *  2. Consumption — of the time actually booked on shareable assets, how much came from
 *     another institution (genuinely shared) versus the owning one (exclusive in practice).
 *
 * An asset flagged shareable that nobody outside ever books is not being shared; it is sitting
 * exclusive with a label on it. That gap is the actionable finding.
 */
@Data
@Builder
public class SharedUsageResponse {

    // ---- Inventory posture ----
    private long shareableEquipmentCount;
    private long exclusiveEquipmentCount;
    /** Share of the catalogue listed for inter-institution sharing, 0-100. */
    private double shareablePercent;

    // ---- Consumption ----
    private long sharedBookedMinutes;
    private long exclusiveBookedMinutes;
    /** Share of all booked time that ran on shareable equipment, 0-100. */
    private double sharedMinutesPercent;

    /** Booked minutes on shareable assets that came from a *different* institution. */
    private long externalBookedMinutes;
    /** Of the time booked on shareable assets, the share consumed externally, 0-100. */
    private double externalUtilizationPercent;

    private double shareableUtilizationRate;
    private double exclusiveUtilizationRate;

    /**
     * Assets listed as shareable that saw no external booking in the window — shared on paper,
     * exclusive in practice.
     */
    private List<UnderSharedEquipment> unrealisedSharing;

    private List<String> insights;

    @Data
    @Builder
    public static class UnderSharedEquipment {
        private Long equipmentId;
        private String equipmentName;
        private String equipmentCode;
        private String institutionName;
        private double utilizationRate;
        private long internalBookings;
    }
}
