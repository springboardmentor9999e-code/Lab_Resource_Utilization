package com.labresource.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * Peak usage pattern analysis over the booking history.
 *
 * The heatmap already exposes the raw day x hour grid; this reduces that grid to the questions a
 * lab manager actually asks — when are we slammed, when are we empty, and how lopsided is demand?
 */
@Data
@Builder
public class PeakUsageResponse {

    private int days;
    private Long equipmentId;

    /** Busiest and quietest hour-of-day across the window (0-23), by booked minutes. */
    private Integer peakHour;
    private String peakHourLabel;
    private long peakHourMinutes;
    private Integer quietestHour;
    private String quietestHourLabel;
    private long quietestHourMinutes;

    /** Busiest and quietest day-of-week (1 = Monday ... 7 = Sunday). */
    private Integer peakDayOfWeek;
    private String peakDayLabel;
    private long peakDayMinutes;
    private Integer quietestDayOfWeek;
    private String quietestDayLabel;
    private long quietestDayMinutes;

    /** Total booked minutes per hour-of-day and per day-of-week — drives the distribution charts. */
    private Map<String, Long> minutesByHour;
    private Map<String, Long> minutesByDay;

    /** The individual day+hour cells under heaviest load. */
    private List<PeakSlot> busiestSlots;

    /** The bookable day+hour cells with the least demand — the slots worth steering people into. */
    private List<PeakSlot> quietestSlots;

    /**
     * Peak-hour load divided by the mean hourly load. 1.0 means demand is perfectly flat; the
     * higher it climbs, the more the schedule is bunched into a few hours and the more capacity
     * is being wasted at other times.
     */
    private double peakToAverageRatio;

    /** Share of all booked minutes that land in the busiest quarter of operating hours (0-100). */
    private double concentrationPercent;

    /** Plain-language findings derived from the numbers above. */
    private List<String> insights;

    @Data
    @Builder
    public static class PeakSlot {
        private int dayOfWeek;
        private String dayLabel;
        private int hour;
        private String hourLabel;
        private long minutes;
        private long bookings;
        /** Load relative to the busiest slot in the window, 0-100. */
        private double intensityPercent;
    }
}
