package com.labresource.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * One alternative the scheduling optimizer proposes when a requested slot cannot be granted
 * (spec Outcome (v): "rule-based scheduling optimization and utilization recommendations").
 */
@Data
@Builder
public class SchedulingSuggestionResponse {

    /**
     * SAME_EQUIPMENT_DIFFERENT_TIME — same asset, shifted within the requested day
     * SAME_EQUIPMENT_LATER_DAY     — same asset, same time, a following day
     * ALTERNATIVE_EQUIPMENT        — a comparable asset free at exactly the requested time
     */
    private String type;

    private Long equipmentId;
    private String equipmentName;
    private String equipmentCode;
    private String category;
    private String labName;
    private String departmentName;

    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;

    /** 0-100. Higher is a better fit for the user and for overall utilization. */
    private double score;

    /** Which rules contributed, in plain language — so the suggestion is explainable, not magic. */
    private List<String> reasons;

    /** Recent utilization of the suggested asset, so the user can see they are relieving a bottleneck. */
    private double utilizationRate;

    /** Minutes this shifts the user from what they originally asked for; 0 for an exact-time match. */
    private long minutesFromRequested;
}
