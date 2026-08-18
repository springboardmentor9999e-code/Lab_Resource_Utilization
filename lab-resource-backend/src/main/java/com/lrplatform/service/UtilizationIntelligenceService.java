package com.lrplatform.service;

import com.lrplatform.dto.response.UtilizationIntelligenceResponse;
import com.lrplatform.dto.response.UtilizationIntelligenceResponse.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
@SuppressWarnings("null")
public class UtilizationIntelligenceService {

    private final JdbcTemplate jdbcTemplate;

    private static final int OPERATING_DAY_START_HOUR = 8;
    private static final int OPERATING_DAY_END_HOUR = 20;
    private static final int DEFAULT_MAX_DAILY_HOURS = 8;
    private static final String BOOKING_STATUS_FILTER = "('APPROVED', 'CONFIRMED', 'IN_USE', 'COMPLETED')";

    public UtilizationIntelligenceResponse getUtilizationIntelligence(LocalDate startDate, LocalDate endDate) {
        return buildResponse(null, null, startDate, endDate);
    }

    public UtilizationIntelligenceResponse getUtilizationIntelligenceByInstitution(Long institutionId, LocalDate startDate, LocalDate endDate) {
        return buildResponse(institutionId, null, startDate, endDate);
    }

    public UtilizationIntelligenceResponse getUtilizationIntelligenceByDepartment(Long departmentId, LocalDate startDate, LocalDate endDate) {
        return buildResponse(null, departmentId, startDate, endDate);
    }

    private UtilizationIntelligenceResponse buildResponse(Long institutionId, Long departmentId, LocalDate startDate, LocalDate endDate) {
        log.info("Building utilization intelligence: institution={}, department={}, range={}/{}", institutionId, departmentId, startDate, endDate);

        long operatingDays = countWeekdays(startDate, endDate);
        List<EquipmentUtilization> equipmentUtils = buildEquipmentUtilizations(institutionId, departmentId, startDate, endDate, operatingDays);
        double overallUtilization = calculateWeightedUtilization(equipmentUtils);
        double overallSessionFrequency = calculateOverallSessionFrequency(equipmentUtils);
        List<DepartmentUtilization> deptUtils = buildDepartmentUtilizations(institutionId, departmentId, startDate, endDate, operatingDays);
        List<IdleEquipment> idleEquipment = buildIdleEquipment(institutionId, departmentId, startDate);
        PeakUsageInfo peakUsage = buildPeakUsageInfo(institutionId, departmentId, startDate, endDate, operatingDays);

        return UtilizationIntelligenceResponse.builder()
                .overallUtilizationRate(overallUtilization)
                .overallSessionFrequency(overallSessionFrequency)
                .totalOperatingDays(operatingDays)
                .dateRangeStart(startDate.toString())
                .dateRangeEnd(endDate.toString())
                .equipmentUtilizations(equipmentUtils)
                .departmentUtilizations(deptUtils)
                .idleEquipment(idleEquipment)
                .peakUsage(peakUsage)
                .build();
    }

    private Map<Long, Long> loadBookedHoursByEquipment(LocalDate startDate, LocalDate endDate) {
        String sql = "SELECT equipment_id, start_time, end_time FROM bookings " +
                "WHERE booking_date BETWEEN ? AND ? " +
                "AND booking_status IN " + BOOKING_STATUS_FILTER;
        Map<Long, Long> hoursMap = new HashMap<>();
        jdbcTemplate.query(sql, (rs) -> {
            Long eqId = rs.getLong("equipment_id");
            LocalTime st = rs.getTime("start_time").toLocalTime();
            LocalTime et = rs.getTime("end_time").toLocalTime();
            long mins = Duration.between(st, et).toMinutes();
            if (mins < 0) mins += 24 * 60;
            hoursMap.merge(eqId, mins / 60, Long::sum);
        }, startDate, endDate);
        return hoursMap;
    }

    private List<EquipmentUtilization> buildEquipmentUtilizations(Long institutionId, Long departmentId,
                                                                    LocalDate startDate, LocalDate endDate,
                                                                    long operatingDays) {
        String baseJoin = "";
        String whereClause = "";
        Object[] params;

        if (departmentId != null) {
            baseJoin = " INNER JOIN laboratories l ON e.laboratory_id = l.id ";
            whereClause = " WHERE l.department_id = ? ";
            params = new Object[]{departmentId};
        } else if (institutionId != null) {
            baseJoin = " INNER JOIN laboratories l ON e.laboratory_id = l.id INNER JOIN departments d ON l.department_id = d.id ";
            whereClause = " WHERE d.institution_id = ? ";
            params = new Object[]{institutionId};
        } else {
            params = new Object[]{};
        }

        String sql = "SELECT e.id, e.equipment_name, e.equipment_code, e.status, " +
                "COALESCE(e.max_booking_hours, " + DEFAULT_MAX_DAILY_HOURS + ") as max_daily_hours, " +
                "COUNT(b.id) as bookings " +
                "FROM equipment e " + baseJoin +
                "LEFT JOIN bookings b ON b.equipment_id = e.id " +
                "AND b.booking_date BETWEEN ? AND ? " +
                "AND b.booking_status IN " + BOOKING_STATUS_FILTER + " " +
                whereClause +
                "GROUP BY e.id, e.equipment_name, e.equipment_code, e.status, e.max_booking_hours " +
                "ORDER BY e.equipment_name";

        Object[] fullParams;
        if (departmentId != null || institutionId != null) {
            fullParams = new Object[params.length + 2];
            fullParams[0] = startDate;
            fullParams[1] = endDate;
            System.arraycopy(params, 0, fullParams, 2, params.length);
        } else {
            fullParams = new Object[]{startDate, endDate};
        }

        Map<Long, Long> bookedHoursMap = loadBookedHoursByEquipment(startDate, endDate);

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            long equipmentId = rs.getLong("id");
            int maxDailyHours = rs.getInt("max_daily_hours");
            long bookings = rs.getLong("bookings");
            long bookedHours = bookedHoursMap.getOrDefault(equipmentId, 0L);
            long availableHours = maxDailyHours * operatingDays;
            double utilRate = availableHours > 0 ? Math.round((double) bookedHours / availableHours * 10000.0) / 100.0 : 0;
            double sessionFreq = operatingDays > 0 ? Math.round((double) bookings / operatingDays * 100.0) / 100.0 : 0;

            List<SlotOccupancy> slotOccupancy = getSlotOccupancy(equipmentId, startDate, endDate, operatingDays);
            double avgSlotOccupancy = slotOccupancy.stream()
                    .mapToDouble(SlotOccupancy::getOccupancyPercent)
                    .average().orElse(0);
            double efficiencyScore = Math.round((utilRate * 0.6 + avgSlotOccupancy * 0.4) * 100.0) / 100.0;

            return EquipmentUtilization.builder()
                    .equipmentId(equipmentId)
                    .equipmentName(rs.getString("equipment_name"))
                    .equipmentCode(rs.getString("equipment_code"))
                    .status(rs.getString("status"))
                    .maxDailyHours(maxDailyHours)
                    .operatingDays(operatingDays)
                    .totalBookings(bookings)
                    .totalBookedHours(bookedHours)
                    .totalAvailableHours(availableHours)
                    .utilizationRate(utilRate)
                    .sessionFrequency(sessionFreq)
                    .efficiencyScore(efficiencyScore)
                    .slotOccupancy(slotOccupancy)
                    .build();
        }, fullParams);
    }

    private List<SlotOccupancy> getSlotOccupancy(Long equipmentId, LocalDate startDate, LocalDate endDate, long operatingDays) {
        String sql = "SELECT start_time, booking_date FROM bookings " +
                "WHERE equipment_id = ? AND booking_date BETWEEN ? AND ? " +
                "AND booking_status IN " + BOOKING_STATUS_FILTER;

        Map<Integer, Set<LocalDate>> daysByHour = new HashMap<>();
        Map<Integer, Long> countByHour = new HashMap<>();

        jdbcTemplate.query(sql, (rs) -> {
            LocalTime time = rs.getTime("start_time").toLocalTime();
            LocalDate date = rs.getDate("booking_date").toLocalDate();
            int hour = time.getHour();
            daysByHour.computeIfAbsent(hour, k -> new HashSet<>()).add(date);
            countByHour.merge(hour, 1L, Long::sum);
        }, equipmentId, startDate, endDate);

        List<SlotOccupancy> slots = new ArrayList<>();
        for (int h = OPERATING_DAY_START_HOUR; h < OPERATING_DAY_END_HOUR; h++) {
            long daysBooked = daysByHour.getOrDefault(h, Collections.emptySet()).size();
            long bookingCount = countByHour.getOrDefault(h, 0L);
            double occupancy = operatingDays > 0 ? Math.round((double) daysBooked / operatingDays * 10000.0) / 100.0 : 0;
            slots.add(SlotOccupancy.builder()
                    .hour(h)
                    .label(String.format("%02d:00-%02d:00", h, h + 1))
                    .occupancyPercent(occupancy)
                    .bookingCount(bookingCount)
                    .daysBooked(daysBooked)
                    .build());
        }
        return slots;
    }

    private double calculateWeightedUtilization(List<EquipmentUtilization> equipmentUtils) {
        if (equipmentUtils.isEmpty()) return 0;
        long totalAvailable = equipmentUtils.stream().mapToLong(EquipmentUtilization::getTotalAvailableHours).sum();
        long totalBooked = equipmentUtils.stream().mapToLong(EquipmentUtilization::getTotalBookedHours).sum();
        return totalAvailable > 0 ? Math.round((double) totalBooked / totalAvailable * 10000.0) / 100.0 : 0;
    }

    private double calculateOverallSessionFrequency(List<EquipmentUtilization> equipmentUtils) {
        if (equipmentUtils.isEmpty()) return 0;
        double totalFreq = equipmentUtils.stream().mapToDouble(EquipmentUtilization::getSessionFrequency).sum();
        return Math.round(totalFreq / equipmentUtils.size() * 100.0) / 100.0;
    }

    private Map<Long, Long> loadDepartmentBookedHours(LocalDate startDate, LocalDate endDate) {
        String sql = "SELECT l.department_id, b.start_time, b.end_time " +
                "FROM bookings b INNER JOIN equipment e ON b.equipment_id = e.id " +
                "INNER JOIN laboratories l ON e.laboratory_id = l.id " +
                "WHERE b.booking_date BETWEEN ? AND ? " +
                "AND b.booking_status IN " + BOOKING_STATUS_FILTER;
        Map<Long, Long> hoursMap = new HashMap<>();
        jdbcTemplate.query(sql, (rs) -> {
            Long deptId = rs.getLong("department_id");
            LocalTime st = rs.getTime("start_time").toLocalTime();
            LocalTime et = rs.getTime("end_time").toLocalTime();
            long mins = Duration.between(st, et).toMinutes();
            if (mins < 0) mins += 24 * 60;
            hoursMap.merge(deptId, mins / 60, Long::sum);
        }, startDate, endDate);
        return hoursMap;
    }

    private List<DepartmentUtilization> buildDepartmentUtilizations(Long institutionId, Long departmentId,
                                                                      LocalDate startDate, LocalDate endDate,
                                                                      long operatingDays) {
        String whereClause;
        Object[] params;

        if (departmentId != null) {
            whereClause = " WHERE d.id = ? ";
            params = new Object[]{departmentId};
        } else if (institutionId != null) {
            whereClause = " WHERE d.institution_id = ? ";
            params = new Object[]{institutionId};
        } else {
            whereClause = "";
            params = new Object[]{};
        }

        String sql = "SELECT d.id as department_id, d.department_name, " +
                "COUNT(DISTINCT e.id) as total_equipment, " +
                "COUNT(DISTINCT b.id) as total_bookings " +
                "FROM departments d " +
                "LEFT JOIN laboratories l ON l.department_id = d.id " +
                "LEFT JOIN equipment e ON e.laboratory_id = l.id " +
                "LEFT JOIN bookings b ON b.equipment_id = e.id " +
                "AND b.booking_date BETWEEN ? AND ? " +
                "AND b.booking_status IN " + BOOKING_STATUS_FILTER + " " +
                whereClause +
                "GROUP BY d.id, d.department_name " +
                "ORDER BY d.department_name";

        Object[] fullParams;
        if (departmentId != null || institutionId != null) {
            fullParams = new Object[params.length + 2];
            fullParams[0] = startDate;
            fullParams[1] = endDate;
            System.arraycopy(params, 0, fullParams, 2, params.length);
        } else {
            fullParams = new Object[]{startDate, endDate};
        }

        Map<Long, Long> deptBookedHours = loadDepartmentBookedHours(startDate, endDate);

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Long deptId = rs.getLong("department_id");
            long totalEquipment = rs.getLong("total_equipment");
            long totalBookings = rs.getLong("total_bookings");
            long bookedHours = deptBookedHours.getOrDefault(deptId, 0L);
            long availableHours = totalEquipment * DEFAULT_MAX_DAILY_HOURS * operatingDays;
            double rate = availableHours > 0 ? Math.round((double) bookedHours / availableHours * 10000.0) / 100.0 : 0;

            return DepartmentUtilization.builder()
                    .departmentId(deptId)
                    .departmentName(rs.getString("department_name"))
                    .totalEquipment(totalEquipment)
                    .totalBookings(totalBookings)
                    .totalBookedHours(bookedHours)
                    .totalAvailableHours(availableHours)
                    .utilizationRate(rate)
                    .build();
        }, fullParams);
    }

    private List<IdleEquipment> buildIdleEquipment(Long institutionId, Long departmentId, LocalDate startDate) {
        String baseJoin = "";
        String whereClause = "";

        if (departmentId != null) {
            baseJoin = " INNER JOIN laboratories l ON e.laboratory_id = l.id INNER JOIN departments d ON l.department_id = d.id ";
            whereClause = " WHERE d.id = ? ";
        } else if (institutionId != null) {
            baseJoin = " INNER JOIN laboratories l ON e.laboratory_id = l.id INNER JOIN departments d ON l.department_id = d.id ";
            whereClause = " WHERE d.institution_id = ? ";
        }

        String sql = "SELECT e.id, e.equipment_name, e.equipment_code, " +
                "COALESCE(d2.department_name, 'Unknown') as department_name, " +
                "MAX(b.booking_date) as last_booking_date " +
                "FROM equipment e " + baseJoin +
                "LEFT JOIN bookings b ON b.equipment_id = e.id " +
                "LEFT JOIN laboratories l2 ON e.laboratory_id = l2.id " +
                "LEFT JOIN departments d2 ON l2.department_id = d2.id " +
                whereClause +
                "GROUP BY e.id, e.equipment_name, e.equipment_code, d2.department_name " +
                "HAVING MAX(b.booking_date) IS NULL OR MAX(b.booking_date) < ? " +
                "ORDER BY last_booking_date ASC";

        Object[] fullParams;
        if (departmentId != null || institutionId != null) {
            fullParams = new Object[]{departmentId != null ? departmentId : institutionId, startDate};
        } else {
            fullParams = new Object[]{startDate};
        }

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            java.sql.Date lastBooking = rs.getDate("last_booking_date");
            int idleDays;
            String lastBookingStr;
            if (lastBooking == null) {
                idleDays = 999;
                lastBookingStr = "Never";
            } else {
                idleDays = (int) (startDate.toEpochDay() - lastBooking.toLocalDate().toEpochDay());
                if (idleDays < 0) idleDays = 0;
                lastBookingStr = lastBooking.toLocalDate().toString();
            }
            return IdleEquipment.builder()
                    .equipmentId(rs.getLong("id"))
                    .equipmentName(rs.getString("equipment_name"))
                    .equipmentCode(rs.getString("equipment_code"))
                    .departmentName(rs.getString("department_name"))
                    .idleDays(idleDays)
                    .lastBookingDate(lastBookingStr)
                    .build();
        }, fullParams);
    }

    private PeakUsageInfo buildPeakUsageInfo(Long institutionId, Long departmentId,
                                              LocalDate startDate, LocalDate endDate, long operatingDays) {
        String joinClause = "";
        String filterClause = "";
        Object[] baseParams;

        if (departmentId != null) {
            joinClause = " INNER JOIN equipment e ON b.equipment_id = e.id INNER JOIN laboratories l ON e.laboratory_id = l.id ";
            filterClause = " AND l.department_id = ? ";
            baseParams = new Object[]{departmentId};
        } else if (institutionId != null) {
            joinClause = " INNER JOIN equipment e ON b.equipment_id = e.id INNER JOIN laboratories l ON e.laboratory_id = l.id INNER JOIN departments d ON l.department_id = d.id ";
            filterClause = " AND d.institution_id = ? ";
            baseParams = new Object[]{institutionId};
        } else {
            baseParams = new Object[]{};
        }

        Object[] params;
        if (institutionId != null || departmentId != null) {
            params = new Object[baseParams.length + 2];
            params[0] = startDate;
            params[1] = endDate;
            System.arraycopy(baseParams, 0, params, 2, baseParams.length);
        } else {
            params = new Object[]{startDate, endDate};
        }

        String peakDay = "N/A";
        String peakHour = "N/A";
        long peakBookings = 0;
        List<HourlyDistribution> hourlyDistribution = new ArrayList<>();

        try {
            String rawSql = "SELECT b.start_time, b.booking_date FROM bookings b " + joinClause +
                    "WHERE b.booking_date BETWEEN ? AND ? " +
                    "AND b.booking_status IN " + BOOKING_STATUS_FILTER + " " + filterClause;

            Map<Integer, Long> hourCounts = new HashMap<>();
            Map<Integer, Long> dayCounts = new HashMap<>();

            jdbcTemplate.query(rawSql, (rs) -> {
                LocalTime time = rs.getTime("start_time").toLocalTime();
                LocalDate date = rs.getDate("booking_date").toLocalDate();
                hourCounts.merge(time.getHour(), 1L, Long::sum);
                int dow = date.getDayOfWeek().getValue() % 7;
                dayCounts.merge(dow, 1L, Long::sum);
            }, params);

            Map.Entry<Integer, Long> peakHourEntry = hourCounts.entrySet().stream()
                    .max(Map.Entry.comparingByValue()).orElse(null);
            if (peakHourEntry != null) {
                peakBookings = peakHourEntry.getValue();
                peakHour = String.format("%02d:00 - %02d:59", peakHourEntry.getKey(), peakHourEntry.getKey());
            }

            Map.Entry<Integer, Long> peakDayEntry = dayCounts.entrySet().stream()
                    .max(Map.Entry.comparingByValue()).orElse(null);
            if (peakDayEntry != null) {
                String[] days = {"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};
                peakDay = days[peakDayEntry.getKey() % 7];
            }

            for (int h = OPERATING_DAY_START_HOUR; h < OPERATING_DAY_END_HOUR; h++) {
                long count = hourCounts.getOrDefault(h, 0L);
                double occupancy = operatingDays > 0 ? Math.round((double) count / operatingDays * 10000.0) / 100.0 : 0;
                hourlyDistribution.add(HourlyDistribution.builder()
                        .hour(h)
                        .bookingCount(count)
                        .occupancyPercent(occupancy)
                        .build());
            }
        } catch (Exception e) {
            log.warn("Could not build peak usage info: {}", e.getMessage());
        }

        return PeakUsageInfo.builder()
                .peakHour(peakHour)
                .peakDay(peakDay)
                .peakBookings(peakBookings)
                .hourlyDistribution(hourlyDistribution)
                .build();
    }

    private long countWeekdays(LocalDate start, LocalDate end) {
        long count = 0;
        LocalDate current = start;
        while (!current.isAfter(end)) {
            DayOfWeek dow = current.getDayOfWeek();
            if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) {
                count++;
            }
            current = current.plusDays(1);
        }
        return count;
    }
}
