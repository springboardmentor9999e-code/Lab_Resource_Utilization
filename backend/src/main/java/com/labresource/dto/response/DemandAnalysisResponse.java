package com.labresource.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * Demand-side counterpart to {@link UtilizationSummaryResponse}.
 *
 * <p>Utilization answers "how much of our capacity did we use". Demand answers the
 * question a procurement decision actually turns on: "how much did people ask for,
 * and how much of that did we have to turn away". The two diverge exactly where it
 * matters — an instrument at 100% utilization looks perfect until you see the twelve
 * people queued behind it.</p>
 *
 * <p>Requested demand is assembled from three signals:</p>
 * <ul>
 *   <li><b>Granted</b> — bookings that were confirmed, in use, or completed.</li>
 *   <li><b>Denied</b> — bookings that were rejected by an approver.</li>
 *   <li><b>Waitlisted</b> — queue entries, the truest unmet-demand signal, since a
 *       user only joins a waitlist after being refused the slot they wanted.</li>
 * </ul>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemandAnalysisResponse {

    private int windowDays;
    private LocalDate from;
    private LocalDate to;

    /** Bookable minutes across all in-scope equipment for the window. */
    private long totalCapacityMinutes;
    /** Granted + denied + waitlisted minutes — everything people asked for. */
    private long totalRequestedMinutes;
    private long totalGrantedMinutes;
    /** Denied + waitlisted minutes — demand the platform could not serve. */
    private long totalUnmetMinutes;

    private long totalRequests;
    private long grantedRequests;
    private long deniedRequests;
    private long waitlistedRequests;

    /** Granted requests as a percentage of all requests. */
    private double fulfilmentRate;
    /** Requested minutes ÷ capacity minutes. Above 1.0 means the platform is oversubscribed. */
    private double contentionIndex;

    /** Equipment where demand meets or exceeds capacity — candidates for procurement. */
    private List<EquipmentDemand> oversubscribed;
    /** Equipment with capacity to spare — candidates for redeployment or retirement. */
    private List<EquipmentDemand> underutilised;
    /** Every in-scope item, hottest first. */
    private List<EquipmentDemand> equipment;

    private List<CategoryDemand> categories;

    /** Plain-language actions derived from the numbers above. */
    private List<String> recommendations;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EquipmentDemand {
        private Long equipmentId;
        private String equipmentName;
        private String equipmentCode;
        private String category;
        private String departmentName;

        private long capacityMinutes;
        private long requestedMinutes;
        private long grantedMinutes;
        private long deniedMinutes;
        private long waitlistedMinutes;
        private long unmetMinutes;

        private long totalRequests;
        private long grantedRequests;
        private long deniedRequests;
        private long waitlistedRequests;
        /** Deepest simultaneous queue observed on any single day in the window. */
        private long peakQueueDepth;

        private double utilizationRate;
        private double fulfilmentRate;
        private double contentionIndex;
        /** OVERSUBSCRIBED | HIGH | BALANCED | LOW | DORMANT */
        private String demandLevel;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryDemand {
        private String category;
        private int equipmentCount;
        private long capacityMinutes;
        private long requestedMinutes;
        private long grantedMinutes;
        private long unmetMinutes;
        private double contentionIndex;
        private double fulfilmentRate;
        /** Items in this category whose demand meets or exceeds their capacity. */
        private int oversubscribedCount;
        /** Items in this category sitting idle — spare capacity that could absorb the pressure. */
        private int dormantCount;
    }
}
