package com.labplatform.labresourceplatform.service;

import com.labplatform.labresourceplatform.entity.Booking;
import com.labplatform.labresourceplatform.entity.Equipment;
import com.labplatform.labresourceplatform.entity.UtilizationLog;
import com.labplatform.labresourceplatform.repository.EquipmentRepository;
import com.labplatform.labresourceplatform.repository.UtilizationLogRepository;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UtilizationService {

    private final UtilizationLogRepository utilizationLogRepository;
    private final EquipmentRepository equipmentRepository;

    // Equipment idle beyond this many hours (with no logged usage) is flagged
    // in the idle report. Set to 1 week (168h) per the "if not used for a week,
    // send an alert" requirement - was previously 72h (3 days), which didn't
    // match that.
    private static final long IDLE_THRESHOLD_HOURS = 24 * 7;

    public UtilizationService(UtilizationLogRepository utilizationLogRepository,
                               EquipmentRepository equipmentRepository) {
        this.utilizationLogRepository = utilizationLogRepository;
        this.equipmentRepository = equipmentRepository;
    }

    // Called when a booking is completed, to record the actual usage session.
    public UtilizationLog logUsageFromBooking(Booking booking) {
        UtilizationLog log = new UtilizationLog();
        log.setEquipment(booking.getEquipment());
        log.setBooking(booking);
        log.setUsageStart(booking.getStartTime());
        log.setUsageEnd(booking.getEndTime());
        log.setDurationMinutes(Duration.between(booking.getStartTime(), booking.getEndTime()).toMinutes());
        return utilizationLogRepository.save(log);
    }

    public UtilizationLog logUsage(UtilizationLog log) {
        if (log.getDurationMinutes() == null && log.getUsageStart() != null && log.getUsageEnd() != null) {
            log.setDurationMinutes(Duration.between(log.getUsageStart(), log.getUsageEnd()).toMinutes());
        }
        return utilizationLogRepository.save(log);
    }

    // Utilization rate = actual used minutes / total available minutes in the window, as a percentage.
    public Map<String, Object> getUtilizationRate(Long equipmentId, LocalDateTime from, LocalDateTime to) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipment not found with id: " + equipmentId));

        long usedMinutes = utilizationLogRepository.sumUsedMinutes(equipmentId, from, to);
        long totalMinutes = Duration.between(from, to).toMinutes();
        double utilizationRate = totalMinutes > 0 ? (usedMinutes * 100.0) / totalMinutes : 0.0;

        Map<String, Object> result = new HashMap<>();
        result.put("equipmentId", equipmentId);
        result.put("equipmentName", equipment.getEquipmentName());
        result.put("windowStart", from);
        result.put("windowEnd", to);
        result.put("usedMinutes", usedMinutes);
        result.put("totalMinutes", totalMinutes);
        result.put("utilizationRatePercent", Math.round(utilizationRate * 100.0) / 100.0);
        return result;
    }

    // Heatmap-ready data: utilization rate per equipment across all equipment, for a given window.
    public List<Map<String, Object>> getUtilizationHeatmap(LocalDateTime from, LocalDateTime to) {
        long totalMinutes = Duration.between(from, to).toMinutes();
        Map<Long, Long> usedMinutesByEquipment = new HashMap<>();

        for (Object[] row : utilizationLogRepository.sumUsedMinutesGroupedByEquipment(from, to)) {
            Long equipmentId = (Long) row[0];
            Long usedMinutes = (Long) row[2];
            usedMinutesByEquipment.put(equipmentId, usedMinutes);
        }

        List<Map<String, Object>> heatmap = new ArrayList<>();
        for (Equipment equipment : equipmentRepository.findAll()) {
            long usedMinutes = usedMinutesByEquipment.getOrDefault(equipment.getEquipmentId(), 0L);
            double utilizationRate = totalMinutes > 0 ? (usedMinutes * 100.0) / totalMinutes : 0.0;

            Map<String, Object> entry = new HashMap<>();
            entry.put("equipmentId", equipment.getEquipmentId());
            entry.put("equipmentName", equipment.getEquipmentName());
            entry.put("category", equipment.getCategory());
            entry.put("usedMinutes", usedMinutes);
            entry.put("utilizationRatePercent", Math.round(utilizationRate * 100.0) / 100.0);
            heatmap.add(entry);
        }
        return heatmap;
    }

    // "Which day is used most" (platform-wide): total minutes used, summed
    // across ALL equipment, grouped by day of week. Based on usageStart (the
    // actual scheduled usage time), not recordedAt (just administrative
    // bookkeeping of when the log was created) - the question is about when
    // equipment gets used, not when someone happened to click "Completed".
    public Map<DayOfWeek, Long> getUsageByDayOfWeek() {
        Map<DayOfWeek, Long> byDay = new EnumMap<>(DayOfWeek.class);
        for (DayOfWeek day : DayOfWeek.values()) {
            byDay.put(day, 0L);
        }
        for (UtilizationLog log : utilizationLogRepository.findAllForPatternAnalysis()) {
            DayOfWeek day = log.getUsageStart().getDayOfWeek();
            byDay.merge(day, log.getDurationMinutes(), Long::sum);
        }
        return byDay;
    }

    // Per-equipment usage pattern: day-of-week breakdown, average session
    // length, and most common start hour - the closest a booking-log-derived
    // dataset can get to "pattern of particular equipment usage" without
    // needing a dedicated ML/statistics layer. Useful for spotting things like
    // "this microscope is booked almost exclusively on Monday mornings."
    public Map<String, Object> getUsagePatternForEquipment(Long equipmentId) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipment not found with id: " + equipmentId));

        List<UtilizationLog> logs = utilizationLogRepository.findByEquipment_EquipmentId(equipmentId);

        Map<DayOfWeek, Long> minutesByDay = new EnumMap<>(DayOfWeek.class);
        for (DayOfWeek day : DayOfWeek.values()) {
            minutesByDay.put(day, 0L);
        }
        Map<Integer, Long> sessionsByStartHour = new HashMap<>();
        long totalMinutes = 0;

        for (UtilizationLog log : logs) {
            DayOfWeek day = log.getUsageStart().getDayOfWeek();
            minutesByDay.merge(day, log.getDurationMinutes(), Long::sum);
            totalMinutes += log.getDurationMinutes();

            int hour = log.getUsageStart().toLocalTime().getHour();
            sessionsByStartHour.merge(hour, 1L, Long::sum);
        }

        DayOfWeek busiestDay = minutesByDay.entrySet().stream()
                .max(Comparator.comparingLong(Map.Entry::getValue))
                .filter(e -> e.getValue() > 0)
                .map(Map.Entry::getKey)
                .orElse(null);

        Integer mostCommonStartHour = sessionsByStartHour.entrySet().stream()
                .max(Comparator.comparingLong(Map.Entry::getValue))
                .map(Map.Entry::getKey)
                .orElse(null);

        Map<String, Object> result = new HashMap<>();
        result.put("equipmentId", equipmentId);
        result.put("equipmentName", equipment.getEquipmentName());
        result.put("totalSessions", logs.size());
        result.put("totalMinutesUsed", totalMinutes);
        result.put("averageSessionMinutes", logs.isEmpty() ? 0 : Math.round((double) totalMinutes / logs.size()));
        result.put("minutesByDayOfWeek", minutesByDay);
        result.put("busiestDayOfWeek", busiestDay);
        result.put("mostCommonStartHour", mostCommonStartHour);
        return result;
    }

    // Flags equipment with no usage logged in the idle threshold window - candidates for
    // "idle equipment" alerts to lab managers, per Milestone 2 requirements.
    public List<Map<String, Object>> getIdleEquipment() {
        LocalDateTime now = LocalDateTime.now();
        List<Map<String, Object>> idleList = new ArrayList<>();

        for (Equipment equipment : equipmentRepository.findAll()) {
            List<UtilizationLog> logs = utilizationLogRepository.findByEquipment_EquipmentId(equipment.getEquipmentId());

            LocalDateTime lastUsed = logs.stream()
                    .map(UtilizationLog::getUsageEnd)
                    .max(LocalDateTime::compareTo)
                    .orElse(null);

            long idleHours = lastUsed == null
                    ? Long.MAX_VALUE
                    : ChronoUnit.HOURS.between(lastUsed, now);

            if (idleHours >= IDLE_THRESHOLD_HOURS) {
                Map<String, Object> entry = new HashMap<>();
                entry.put("equipmentId", equipment.getEquipmentId());
                entry.put("equipmentName", equipment.getEquipmentName());
                entry.put("status", equipment.getStatus());
                entry.put("lastUsed", lastUsed);
                entry.put("idleHours", lastUsed == null ? null : idleHours);
                idleList.add(entry);
            }
        }
        return idleList;
    }
}
