package com.labresource.service.impl;

import com.labresource.dto.response.SchedulingSuggestionResponse;
import com.labresource.entity.Booking;
import com.labresource.entity.Equipment;
import com.labresource.repository.BookingRepository;
import com.labresource.repository.EquipmentRepository;
import com.labresource.repository.UtilizationBookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Rule-based scheduling optimization.
 *
 * When a requested slot is unavailable the platform's only previous answer was "join the waitlist".
 * This proposes concrete alternatives instead, ranked by a fixed, explainable rule set — the goal
 * being to satisfy the user *and* pull load off the busiest assets and hours.
 *
 * The rules, in the order they matter:
 *
 *   R1  Keep the user's time if at all possible. Being moved to a different microscope at 10:00 is
 *       usually far less disruptive than keeping the same microscope but coming in at 17:00.
 *   R2  Failing that, stay on the same asset and shift the time as little as possible.
 *   R3  Prefer under-utilized assets. Two otherwise-equal options are not equal: routing to the
 *       quieter unit is what actually raises fleet utilization.
 *   R4  Steer away from peak hours, so suggestions do not simply rebuild the congestion.
 *   R5  Never propose an asset that is not bookable (maintenance, retired, out of service), and
 *       never propose a slot that is already taken.
 *   R6  Prefer an asset in the same department — closer to the user, and usually the same access
 *       rules.
 *
 * Scores are relative, not absolute: they exist to order the list, and each is accompanied by the
 * reasons that produced it so a user can see why something was recommended.
 */
@Service
@RequiredArgsConstructor
public class SchedulingOptimizerService {

    private static final int DAY_START_HOUR = 8;
    private static final int DAY_END_HOUR = 20;
    /** Candidate start times are generated on this grid. */
    private static final int SLOT_STEP_MINUTES = 30;
    /** How many days forward to look when the requested day is full. */
    private static final int LOOKAHEAD_DAYS = 7;
    /** Window used to judge how busy an asset has been. */
    private static final int UTILIZATION_WINDOW_DAYS = 30;
    private static final int OPERATING_MINUTES_PER_DAY = 720;

    private static final Set<String> BOOKABLE_EXCLUDED_STATUSES =
            Set.of("UNDER_MAINTENANCE", "OUT_OF_SERVICE", "RETIRED", "LOST");
    private static final List<String> ACTIVE_STATUSES = List.of("CONFIRMED", "IN_USE", "COMPLETED");

    // Base scores by suggestion type — R1 outranks R2 by construction
    private static final double SCORE_ALTERNATIVE_EQUIPMENT = 90.0;
    private static final double SCORE_SAME_EQUIPMENT_SAME_DAY = 78.0;
    private static final double SCORE_SAME_EQUIPMENT_LATER_DAY = 62.0;

    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;
    private final UtilizationBookingRepository utilizationBookingRepository;

    /**
     * Ranked alternatives for a slot the user could not get.
     *
     * @param limit maximum suggestions to return; the list may be shorter when the fleet is busy
     */
    @Transactional(readOnly = true)
    public List<SchedulingSuggestionResponse> suggest(Long equipmentId, LocalDate date,
                                                      LocalTime startTime, LocalTime endTime,
                                                      int limit) {
        Equipment requested = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        if (date == null || startTime == null || endTime == null) {
            throw new IllegalArgumentException("Date, start time and end time are required");
        }
        if (!endTime.isAfter(startTime)) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        long durationMinutes = Duration.between(startTime, endTime).toMinutes();
        Map<Long, Double> utilizationByEquipment = utilizationRates();
        long[] peakLoadByHour = peakLoadByHour();

        List<SchedulingSuggestionResponse> suggestions = new ArrayList<>();

        // R1 — comparable equipment, free at exactly the time the user asked for
        suggestions.addAll(alternativeEquipmentAtSameTime(
                requested, date, startTime, endTime, utilizationByEquipment, peakLoadByHour));

        // R2 — same equipment, nearest free window on the requested day
        suggestions.addAll(sameEquipmentOtherTimes(
                requested, date, startTime, durationMinutes, utilizationByEquipment, peakLoadByHour));

        // R2 (fallback) — same equipment, same time, on a following day
        suggestions.addAll(sameEquipmentLaterDays(
                requested, date, startTime, endTime, utilizationByEquipment, peakLoadByHour));

        return suggestions.stream()
                .sorted(Comparator.comparingDouble(SchedulingSuggestionResponse::getScore).reversed()
                        .thenComparingLong(SchedulingSuggestionResponse::getMinutesFromRequested))
                .limit(Math.max(1, limit))
                .collect(Collectors.toList());
    }

    // ------------------------------------------------------------------
    // R1 — a different asset at the requested time
    // ------------------------------------------------------------------

    private List<SchedulingSuggestionResponse> alternativeEquipmentAtSameTime(
            Equipment requested, LocalDate date, LocalTime startTime, LocalTime endTime,
            Map<Long, Double> utilization, long[] peakLoadByHour) {

        // "Comparable" means same category — the closest thing to a like-for-like substitute the
        // catalogue models. Anything looser would suggest a centrifuge in place of a microscope.
        List<Equipment> candidates = equipmentRepository.findByCategoryIgnoreCase(requested.getCategory());

        List<SchedulingSuggestionResponse> out = new ArrayList<>();
        for (Equipment candidate : candidates) {
            if (candidate.getEquipmentId().equals(requested.getEquipmentId())) {
                continue;
            }
            if (!isBookable(candidate)) {
                continue; // R5
            }
            if (bookingRepository.hasOverlappingBooking(
                    candidate.getEquipmentId(), date, startTime, endTime)) {
                continue; // R5
            }

            double rate = utilization.getOrDefault(candidate.getEquipmentId(), 0.0);
            List<String> reasons = new ArrayList<>();
            reasons.add("Free at exactly your requested time — no need to change your plans");

            double score = SCORE_ALTERNATIVE_EQUIPMENT;
            score += loadBalancingBonus(rate, reasons); // R3

            // R6 — same department is a better substitute than one across the building
            if (sameDepartment(requested, candidate)) {
                score += 4.0;
                reasons.add("In the same department as the equipment you asked for");
            }

            out.add(build("ALTERNATIVE_EQUIPMENT", candidate, date, startTime, endTime,
                    score, reasons, rate, 0L));
        }
        return out;
    }

    // ------------------------------------------------------------------
    // R2 — the same asset, shifted within the requested day
    // ------------------------------------------------------------------

    private List<SchedulingSuggestionResponse> sameEquipmentOtherTimes(
            Equipment requested, LocalDate date, LocalTime requestedStart, long durationMinutes,
            Map<Long, Double> utilization, long[] peakLoadByHour) {

        if (!isBookable(requested)) {
            return List.of();
        }

        double rate = utilization.getOrDefault(requested.getEquipmentId(), 0.0);
        List<SchedulingSuggestionResponse> out = new ArrayList<>();

        LocalTime dayStart = LocalTime.of(DAY_START_HOUR, 0);
        LocalTime dayEnd = LocalTime.of(DAY_END_HOUR, 0);

        for (LocalTime slotStart = dayStart;
             !slotStart.plusMinutes(durationMinutes).isAfter(dayEnd);
             slotStart = slotStart.plusMinutes(SLOT_STEP_MINUTES)) {

            LocalTime slotEnd = slotStart.plusMinutes(durationMinutes);
            if (slotStart.equals(requestedStart)) {
                continue; // that is the slot they could not have
            }
            if (bookingRepository.hasOverlappingBooking(
                    requested.getEquipmentId(), date, slotStart, slotEnd)) {
                continue; // R5
            }

            long displacement = Math.abs(Duration.between(requestedStart, slotStart).toMinutes());
            List<String> reasons = new ArrayList<>();
            reasons.add("Same equipment, " + describeShift(requestedStart, slotStart)
                    + " on the day you asked for");

            // The further from the requested time, the worse the fit — half a point per 30 minutes
            double score = SCORE_SAME_EQUIPMENT_SAME_DAY - (displacement / 30.0) * 1.5;
            score += quietHourBonus(slotStart, peakLoadByHour, reasons); // R4

            out.add(build("SAME_EQUIPMENT_DIFFERENT_TIME", requested, date, slotStart, slotEnd,
                    score, reasons, rate, displacement));
        }

        // Only the few nearest alternatives are useful; a full day of 30-minute options is noise
        return out.stream()
                .sorted(Comparator.comparingLong(SchedulingSuggestionResponse::getMinutesFromRequested))
                .limit(4)
                .collect(Collectors.toList());
    }

    // ------------------------------------------------------------------
    // R2 fallback — the same asset and time, on a later day
    // ------------------------------------------------------------------

    private List<SchedulingSuggestionResponse> sameEquipmentLaterDays(
            Equipment requested, LocalDate date, LocalTime startTime, LocalTime endTime,
            Map<Long, Double> utilization, long[] peakLoadByHour) {

        if (!isBookable(requested)) {
            return List.of();
        }

        double rate = utilization.getOrDefault(requested.getEquipmentId(), 0.0);
        List<SchedulingSuggestionResponse> out = new ArrayList<>();

        for (int offset = 1; offset <= LOOKAHEAD_DAYS && out.size() < 3; offset++) {
            LocalDate candidateDate = date.plusDays(offset);
            if (bookingRepository.hasOverlappingBooking(
                    requested.getEquipmentId(), candidateDate, startTime, endTime)) {
                continue; // R5
            }

            List<String> reasons = new ArrayList<>();
            reasons.add("Same equipment at your requested time, "
                    + (offset == 1 ? "the next day" : offset + " days later"));

            // Each day of delay costs more than a same-day shift of a couple of hours
            double score = SCORE_SAME_EQUIPMENT_LATER_DAY - offset * 2.0;

            out.add(build("SAME_EQUIPMENT_LATER_DAY", requested, candidateDate, startTime, endTime,
                    score, reasons, rate, (long) offset * 24 * 60));
        }
        return out;
    }

    // ------------------------------------------------------------------
    // Rule helpers
    // ------------------------------------------------------------------

    /** R3 — reward routing work onto quieter assets, which is what actually lifts utilization. */
    private double loadBalancingBonus(double utilizationRate, List<String> reasons) {
        if (utilizationRate < 20.0) {
            reasons.add("Currently under-used (" + utilizationRate + "% utilization) — booking it"
                    + " here improves overall fleet balance");
            return 6.0;
        }
        if (utilizationRate < 50.0) {
            reasons.add("Moderately loaded (" + utilizationRate + "% utilization)");
            return 3.0;
        }
        if (utilizationRate >= 80.0) {
            reasons.add("Heavily booked (" + utilizationRate + "% utilization)");
            return -4.0;
        }
        return 0.0;
    }

    /** R4 — nudge users out of the hours that are already congested. */
    private double quietHourBonus(LocalTime slotStart, long[] peakLoadByHour, List<String> reasons) {
        int hour = slotStart.getHour();
        if (hour < DAY_START_HOUR || hour >= DAY_END_HOUR) {
            return 0.0;
        }

        long total = 0;
        long busiest = 0;
        for (int h = DAY_START_HOUR; h < DAY_END_HOUR; h++) {
            total += peakLoadByHour[h];
            busiest = Math.max(busiest, peakLoadByHour[h]);
        }
        if (total == 0 || busiest == 0) {
            return 0.0;
        }

        double relative = peakLoadByHour[hour] / (double) busiest;
        if (relative <= 0.25) {
            reasons.add("Falls in a quiet hour — helps flatten the daily peak");
            return 5.0;
        }
        if (relative >= 0.85) {
            reasons.add("Falls inside the busiest part of the day");
            return -3.0;
        }
        return 0.0;
    }

    private boolean isBookable(Equipment equipment) {
        return equipment.getStatus() == null
                || !BOOKABLE_EXCLUDED_STATUSES.contains(equipment.getStatus());
    }

    private boolean sameDepartment(Equipment a, Equipment b) {
        return a.getDepartment() != null && b.getDepartment() != null
                && a.getDepartment().getDepartmentId().equals(b.getDepartment().getDepartmentId());
    }

    private String describeShift(LocalTime requested, LocalTime candidate) {
        long minutes = Duration.between(requested, candidate).toMinutes();
        String direction = minutes < 0 ? "earlier" : "later";
        long abs = Math.abs(minutes);
        if (abs < 60) {
            return abs + " minutes " + direction;
        }
        long hours = abs / 60;
        long rem = abs % 60;
        return rem == 0
                ? hours + (hours == 1 ? " hour " : " hours ") + direction
                : hours + "h" + rem + "m " + direction;
    }

    /** Recent utilization rate per equipment, from one query over the whole window. */
    private Map<Long, Double> utilizationRates() {
        LocalDate today = LocalDate.now();
        List<Booking> bookings = utilizationBookingRepository.findInWindow(
                today.minusDays(UTILIZATION_WINDOW_DAYS), today, ACTIVE_STATUSES);

        Map<Long, Long> minutesByEquipment = new HashMap<>();
        for (Booking b : bookings) {
            long minutes = Duration.between(b.getStartTime(), b.getEndTime()).toMinutes();
            if (minutes > 0) {
                minutesByEquipment.merge(b.getEquipment().getEquipmentId(), minutes, Long::sum);
            }
        }

        long capacity = (long) UTILIZATION_WINDOW_DAYS * OPERATING_MINUTES_PER_DAY;
        Map<Long, Double> rates = new HashMap<>();
        minutesByEquipment.forEach((id, minutes) ->
                rates.put(id, Math.round(Math.min(100.0, minutes * 100.0 / capacity) * 10.0) / 10.0));
        return rates;
    }

    /** Booked minutes per hour-of-day across the fleet — the congestion profile R4 steers against. */
    private long[] peakLoadByHour() {
        LocalDate today = LocalDate.now();
        List<Booking> bookings = utilizationBookingRepository.findInWindow(
                today.minusDays(UTILIZATION_WINDOW_DAYS), today, ACTIVE_STATUSES);

        long[] byHour = new long[24];
        for (Booking b : bookings) {
            int startMin = b.getStartTime().toSecondOfDay() / 60;
            int endMin = b.getEndTime().toSecondOfDay() / 60;
            for (int hour = DAY_START_HOUR; hour < DAY_END_HOUR; hour++) {
                int slotStart = hour * 60;
                int overlap = Math.min(endMin, slotStart + 60) - Math.max(startMin, slotStart);
                if (overlap > 0) {
                    byHour[hour] += overlap;
                }
            }
        }
        return byHour;
    }

    private SchedulingSuggestionResponse build(String type, Equipment equipment, LocalDate date,
                                               LocalTime start, LocalTime end, double score,
                                               List<String> reasons, double utilizationRate,
                                               long minutesFromRequested) {
        return SchedulingSuggestionResponse.builder()
                .type(type)
                .equipmentId(equipment.getEquipmentId())
                .equipmentName(equipment.getEquipmentName())
                .equipmentCode(equipment.getEquipmentCode())
                .category(equipment.getCategory())
                .labName(equipment.getLab() != null ? equipment.getLab().getName() : null)
                .departmentName(equipment.getDepartment() != null
                        ? equipment.getDepartment().getName() : null)
                .bookingDate(date)
                .startTime(start)
                .endTime(end)
                .score(Math.round(Math.max(0, score) * 10.0) / 10.0)
                .reasons(reasons)
                .utilizationRate(utilizationRate)
                .minutesFromRequested(minutesFromRequested)
                .build();
    }
}
