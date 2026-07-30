package com.lrplatform.service;

import com.lrplatform.dto.response.UtilizationIntelligenceResponse;
import com.lrplatform.dto.response.UtilizationIntelligenceResponse.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

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
    private static final String BOOKING_STATUS_FILTER = "('COMPLETED', 'CONFIRMED', 'IN_USE')";

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
                "COUNT(b.id) as bookings, " +
                "COALESCE(SUM(" + timeDiffSecs("b.end_time", "b.start_time") + " / 3600), 0) as booked_hours " +
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

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            long equipmentId = rs.getLong("id");
            int maxDailyHours = rs.getInt("max_daily_hours");
            long bookings = rs.getLong("bookings");
            long bookedHours = rs.getLong("booked_hours");
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
        String hourExpr = "CAST(SUBSTRING(CAST(start_time AS VARCHAR) FROM 1 FOR 2) AS INTEGER)";
        String sql = "SELECT " + hourExpr + " as hour, " +
                "COUNT(DISTINCT booking_date) as days_booked, " +
                "COUNT(*) as booking_count " +
                "FROM bookings " +
                "WHERE equipment_id = ? " +
                "AND booking_date BETWEEN ? AND ? " +
                "AND booking_status IN " + BOOKING_STATUS_FILTER + " " +
                "AND " + hourExpr + " >= ? AND " + hourExpr + " < ? " +
                "GROUP BY " + hourExpr + " " +
                "ORDER BY hour";

        List<SlotOccupancy> slots = new ArrayList<>();
        Map<Integer, Long> slotMap = new java.util.HashMap<>();
        Map<Integer, Long> countMap = new java.util.HashMap<>();

        jdbcTemplate.query(sql, (rs, rowNum) -> {
            int hour = rs.getInt("hour");
            slotMap.put(hour, rs.getLong("days_booked"));
            countMap.put(hour, rs.getLong("booking_count"));
            return null;
        }, equipmentId, startDate, endDate, OPERATING_DAY_START_HOUR, OPERATING_DAY_END_HOUR);

        for (int h = OPERATING_DAY_START_HOUR; h < OPERATING_DAY_END_HOUR; h++) {
            long daysBooked = slotMap.getOrDefault(h, 0L);
            long bookingCount = countMap.getOrDefault(h, 0L);
            double occupancy = operatingDays > 0 ? Math.round((double) daysBooked / operatingDays * 10000.0) / 100.0 : 0;
            String label = String.format("%02d:00-%02d:00", h, h + 1);
            slots.add(SlotOccupancy.builder()
                    .hour(h)
                    .label(label)
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
                "COUNT(DISTINCT b.id) as total_bookings, " +
                "COALESCE(SUM(DISTINCT 0) + 0, 0) as placeholder " +
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

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Long deptId = rs.getLong("department_id");
            long totalEquipment = rs.getLong("total_equipment");
            long totalBookings = rs.getLong("total_bookings");

            long[] hours = getDepartmentBookedAndAvailableHours(deptId, startDate, endDate, operatingDays);
            long bookedHours = hours[0];
            long availableHours = hours[1];
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

    private long[] getDepartmentBookedAndAvailableHours(Long departmentId, LocalDate startDate, LocalDate endDate, long operatingDays) {
        String sql = "SELECT COALESCE(SUM(" + timeDiffSecs("b.end_time", "b.start_time") + " / 3600), 0) as booked, " +
                "COALESCE(SUM(COALESCE(e.max_booking_hours, " + DEFAULT_MAX_DAILY_HOURS + ") * " + operatingDays + "), 0) as available " +
                "FROM equipment e " +
                "INNER JOIN laboratories l ON e.laboratory_id = l.id " +
                "LEFT JOIN bookings b ON b.equipment_id = e.id " +
                "AND b.booking_date BETWEEN ? AND ? " +
                "AND b.booking_status IN " + BOOKING_STATUS_FILTER + " " +
                "WHERE l.department_id = ?";

        return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> new long[]{
                rs.getLong("booked"), rs.getLong("available")
        }, startDate, endDate, departmentId);
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

        String peakHourSql = "SELECT " + hourExpr("b.start_time") + " as hour, COUNT(*) as count " +
                "FROM bookings b " + joinClause +
                "WHERE b.booking_date BETWEEN ? AND ? " +
                "AND b.booking_status IN " + BOOKING_STATUS_FILTER + " " + filterClause +
                "GROUP BY " + hourExpr("b.start_time") + " ORDER BY count DESC LIMIT 1";

        String peakDaySql = "SELECT EXTRACT(DOW FROM b.booking_date) as day_of_week, COUNT(*) as count " +
                "FROM bookings b " + joinClause +
                "WHERE b.booking_date BETWEEN ? AND ? " +
                "AND b.booking_status IN " + BOOKING_STATUS_FILTER + " " + filterClause +
                "GROUP BY EXTRACT(DOW FROM b.booking_date) ORDER BY count DESC LIMIT 1";

        String hourlySql = "SELECT " + hourExpr("b.start_time") + " as hour, COUNT(*) as count " +
                "FROM bookings b " + joinClause +
                "WHERE b.booking_date BETWEEN ? AND ? " +
                "AND b.booking_status IN " + BOOKING_STATUS_FILTER + " " + filterClause +
                "GROUP BY " + hourExpr("b.start_time") + " ORDER BY hour";

        String peakHour = "N/A";
        long peakBookings = 0;
        try {
            Object[] peakHourParams = buildParams(startDate, endDate, baseParams);
            List<Map<String, Object>> results = jdbcTemplate.queryForList(peakHourSql, peakHourParams);
            if (!results.isEmpty()) {
                int hour = ((Number) results.get(0).get("hour")).intValue();
                peakBookings = ((Number) results.get(0).get("count")).longValue();
                peakHour = String.format("%02d:00 - %02d:59", hour, hour);
            }
        } catch (Exception e) {
            log.warn("Could not determine peak hour: {}", e.getMessage());
        }

        String peakDay = "N/A";
        try {
            Object[] peakDayParams = buildParams(startDate, endDate, baseParams);
            List<Map<String, Object>> results = jdbcTemplate.queryForList(peakDaySql, peakDayParams);
            if (!results.isEmpty()) {
                int dayOfWeek = ((Number) results.get(0).get("day_of_week")).intValue();
                String[] days = {"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};
                peakDay = days[dayOfWeek % 7];
            }
        } catch (Exception e) {
            log.warn("Could not determine peak day: {}", e.getMessage());
        }

        List<HourlyDistribution> hourlyDistribution = new ArrayList<>();
        try {
            Object[] hourlyParams = buildParams(startDate, endDate, baseParams);
            List<Map<String, Object>> hourlyResults = jdbcTemplate.queryForList(hourlySql, hourlyParams);
            long[] hourCounts = new long[24];
            for (Map<String, Object> row : hourlyResults) {
                int h = ((Number) row.get("hour")).intValue();
                hourCounts[h] = ((Number) row.get("count")).longValue();
            }
            long maxCount = java.util.Arrays.stream(hourCounts).max().orElse(1);
            for (int h = OPERATING_DAY_START_HOUR; h < OPERATING_DAY_END_HOUR; h++) {
                double occupancy = operatingDays > 0 ? Math.round((double) hourCounts[h] / operatingDays * 10000.0) / 100.0 : 0;
                hourlyDistribution.add(HourlyDistribution.builder()
                        .hour(h)
                        .bookingCount(hourCounts[h])
                        .occupancyPercent(occupancy)
                        .build());
            }
        } catch (Exception e) {
            log.warn("Could not build hourly distribution: {}", e.getMessage());
        }

        return PeakUsageInfo.builder()
                .peakHour(peakHour)
                .peakDay(peakDay)
                .peakBookings(peakBookings)
                .hourlyDistribution(hourlyDistribution)
                .build();
    }

    private Object[] buildParams(LocalDate startDate, LocalDate endDate, Object[] existing) {
        Object[] result = new Object[existing.length + 2];
        result[0] = startDate;
        result[1] = endDate;
        System.arraycopy(existing, 0, result, 2, existing.length);
        return result;
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

    private static String hourExpr(String col) {
        return "CAST(SUBSTRING(CAST(" + col + " AS VARCHAR) FROM 1 FOR 2) AS INTEGER)";
    }

    private static String timeDiffSecs(String endCol, String startCol) {
        String h = "CAST(SUBSTRING(CAST(%s AS VARCHAR) FROM 1 FOR 2) AS INTEGER)";
        String m = "CAST(SUBSTRING(CAST(%s AS VARCHAR) FROM 4 FOR 2) AS INTEGER)";
        return "((" + String.format(h, endCol) + " * 3600 + " + String.format(m, endCol) + " * 60)" +
               " - (" + String.format(h, startCol) + " * 3600 + " + String.format(m, startCol) + " * 60))";
    }
}
