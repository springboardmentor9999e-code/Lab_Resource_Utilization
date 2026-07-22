package com.labplatform.labresourceplatform.service;

import com.labplatform.labresourceplatform.entity.Booking;
import com.labplatform.labresourceplatform.entity.Equipment;
import com.labplatform.labresourceplatform.entity.UtilizationLog;
import com.labplatform.labresourceplatform.repository.EquipmentRepository;
import com.labplatform.labresourceplatform.repository.UtilizationLogRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UtilizationService {

    private final UtilizationLogRepository utilizationLogRepository;
    private final EquipmentRepository equipmentRepository;

    // Equipment idle beyond this many hours (with no logged usage) is flagged in the idle report.
    private static final long IDLE_THRESHOLD_HOURS = 72;

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
