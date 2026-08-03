package com.labresource.controller;

import com.labresource.dto.*;
import com.labresource.entity.Booking;
import com.labresource.entity.BookingStatus;
import com.labresource.entity.Equipment;
import com.labresource.repository.BookingRepository;
import com.labresource.repository.EquipmentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/utilization")
public class UtilizationController {

    private static final int WINDOW_DAYS = 30;
    private static final double WINDOW_HOURS = WINDOW_DAYS * 24.0;
    private static final long IDLE_ALERT_THRESHOLD_DAYS = 14; // NEW

    private final BookingRepository bookingRepository;
    private final EquipmentRepository equipmentRepository;

    public UtilizationController(BookingRepository bookingRepository, EquipmentRepository equipmentRepository) {
        this.bookingRepository = bookingRepository;
        this.equipmentRepository = equipmentRepository;
    }

    @GetMapping
    public ResponseEntity<List<UtilizationStats>> getUtilization() {

        LocalDateTime windowStart = LocalDateTime.now().minusDays(WINDOW_DAYS);
        List<Equipment> allEquipment = equipmentRepository.findAll();
        List<Booking> allBookings = bookingRepository.findAll();

        List<UtilizationStats> stats = allEquipment.stream().map(equipment -> {

            List<Booking> usedBookings = allBookings.stream()
                    .filter(b -> b.getEquipmentId().equals(equipment.getId()))
                    .filter(b -> b.getStatus() == BookingStatus.CONFIRMED
                            || b.getStatus() == BookingStatus.IN_USE
                            || b.getStatus() == BookingStatus.COMPLETED)
                    .collect(Collectors.toList());

            List<Booking> relevantBookings = usedBookings.stream()
                    .filter(b -> b.getEndTime().isAfter(windowStart))
                    .collect(Collectors.toList());

            double bookedHours = relevantBookings.stream()
                    .mapToDouble(b -> ChronoUnit.MINUTES.between(b.getStartTime(), b.getEndTime()) / 60.0)
                    .sum();

            double utilizationRate = Math.min(100.0, (bookedHours / WINDOW_HOURS) * 100.0);

            String usageLevel;
            if (utilizationRate < 5) usageLevel = "Idle";
            else if (utilizationRate < 25) usageLevel = "Low";
            else if (utilizationRate < 60) usageLevel = "Moderate";
            else usageLevel = "High";

            // --- Idle time detection (NEW) ---
            LocalDateTime lastUsedEnd = usedBookings.stream()
                    .map(Booking::getEndTime)
                    .max(LocalDateTime::compareTo)
                    .orElse(equipment.getCreatedAt()); // if never used, measure from when it was added

            long idleDays = ChronoUnit.DAYS.between(lastUsedEnd, LocalDateTime.now());
            boolean idleAlert = idleDays >= IDLE_ALERT_THRESHOLD_DAYS;
            // --- end idle detection ---

            return new UtilizationStats(
                    equipment.getId(),
                    equipment.getName(),
                    equipment.getCategory(),
                    relevantBookings.size(),
                    Math.round(bookedHours * 10.0) / 10.0,
                    Math.round(utilizationRate * 10.0) / 10.0,
                    usageLevel,
                    idleDays,
                    idleAlert
            );
        }).collect(Collectors.toList());

        return ResponseEntity.ok(stats);
    }

    // NEW — demand analysis: what hours/days see the most booking activity
    @GetMapping("/demand-analysis")
    public ResponseEntity<DemandAnalysisResponse> getDemandAnalysis() {

        List<Booking> relevantBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED
                        || b.getStatus() == BookingStatus.IN_USE
                        || b.getStatus() == BookingStatus.COMPLETED)
                .collect(Collectors.toList());

        long[] hourCounts = new long[24];
        for (Booking b : relevantBookings) {
            hourCounts[b.getStartTime().getHour()]++;
        }
        List<HourlyDemand> hourly = new ArrayList<>();
        for (int h = 0; h < 24; h++) {
            hourly.add(new HourlyDemand(h, hourCounts[h]));
        }

        List<DayOfWeek> weekOrder = Arrays.asList(
                DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
                DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY
        );
        List<DayDemand> byDayOfWeek = new ArrayList<>();
        for (DayOfWeek day : weekOrder) {
            long count = relevantBookings.stream()
                    .filter(b -> b.getStartTime().getDayOfWeek() == day)
                    .count();
            byDayOfWeek.add(new DayDemand(day.name(), count));
        }

        return ResponseEntity.ok(new DemandAnalysisResponse(hourly, byDayOfWeek));
    }

    // NEW — heatmap: booked hours per equipment for each of the last 7 days
    @GetMapping("/heatmap")
    public ResponseEntity<HeatmapResponse> getHeatmap() {

        LocalDate today = LocalDate.now();
        List<LocalDate> last7Days = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            last7Days.add(today.minusDays(i));
        }

        List<Equipment> allEquipment = equipmentRepository.findAll();
        List<Booking> allBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED
                        || b.getStatus() == BookingStatus.IN_USE
                        || b.getStatus() == BookingStatus.COMPLETED)
                .collect(Collectors.toList());

        List<EquipmentHeatmapRow> rows = allEquipment.stream().map(equipment -> {
            List<Double> dailyHours = new ArrayList<>();
            for (LocalDate day : last7Days) {
                // Simplification: attributes a booking's full duration to its start date
                // (assumes bookings don't span midnight — true for typical short lab sessions)
                double hoursThisDay = allBookings.stream()
                        .filter(b -> b.getEquipmentId().equals(equipment.getId()))
                        .filter(b -> b.getStartTime().toLocalDate().equals(day))
                        .mapToDouble(b -> ChronoUnit.MINUTES.between(b.getStartTime(), b.getEndTime()) / 60.0)
                        .sum();
                dailyHours.add(Math.round(hoursThisDay * 10.0) / 10.0);
            }
            return new EquipmentHeatmapRow(equipment.getId(), equipment.getName(), dailyHours);
        }).collect(Collectors.toList());

        List<String> dayLabels = last7Days.stream().map(LocalDate::toString).collect(Collectors.toList());

        return ResponseEntity.ok(new HeatmapResponse(dayLabels, rows));
    }
}