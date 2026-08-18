package com.lrplatform.service;

import com.lrplatform.dto.response.EquipmentLifecycleResponse;
import com.lrplatform.dto.response.EquipmentLifecycleResponse.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
@SuppressWarnings("null")
public class EquipmentLifecycleService {

    private final JdbcTemplate jdbcTemplate;

    public EquipmentLifecycleResponse getEquipmentLifecycle() {
        log.info("Building equipment lifecycle response");
        List<EquipmentLifecycle> lifecycles = buildEquipmentLifecycles();
        return buildLifecycleResponse(lifecycles);
    }

    public EquipmentLifecycleResponse getEquipmentLifecycleByInstitution(Long institutionId) {
        log.info("Building equipment lifecycle response for institution: {}", institutionId);

        List<EquipmentLifecycle> lifecycles = buildEquipmentLifecyclesByInstitution(institutionId);
        return buildLifecycleResponse(lifecycles);
    }

    public EquipmentLifecycleResponse getEquipmentLifecycleByDepartment(Long departmentId) {
        log.info("Building equipment lifecycle response for department: {}", departmentId);

        List<EquipmentLifecycle> lifecycles = buildEquipmentLifecyclesByDepartment(departmentId);
        return buildLifecycleResponse(lifecycles);
    }

    private List<EquipmentLifecycle> buildEquipmentLifecycles() {
        String sql = """
            SELECT e.id, e.equipment_name, e.equipment_code, e.purchase_cost,
                   e.purchase_date, e.warranty_expiry, e.status,
                   COALESCE(m.maintenance_cost, 0) as maintenance_cost,
                   COALESCE(b.booking_count, 0) as booking_count
            FROM equipment e
            LEFT JOIN (
                SELECT equipment_id, SUM(total_cost) as maintenance_cost
                FROM maintenance_work_orders
                WHERE status = 'COMPLETED'
                GROUP BY equipment_id
            ) m ON m.equipment_id = e.id
            LEFT JOIN (
                SELECT equipment_id, COUNT(id) as booking_count
                FROM bookings
                WHERE booking_status IN ('APPROVED', 'CONFIRMED', 'IN_USE', 'COMPLETED')
                GROUP BY equipment_id
            ) b ON b.equipment_id = e.id
            ORDER BY e.equipment_name
            """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> buildLifecycleFromRow(rs));
    }

    private List<EquipmentLifecycle> buildEquipmentLifecyclesByInstitution(Long institutionId) {
        String sql = """
            SELECT e.id, e.equipment_name, e.equipment_code, e.purchase_cost,
                   e.purchase_date, e.warranty_expiry, e.status,
                   COALESCE(m.maintenance_cost, 0) as maintenance_cost,
                   COALESCE(b.booking_count, 0) as booking_count
            FROM equipment e
            INNER JOIN laboratories l ON e.laboratory_id = l.id
            INNER JOIN departments d ON l.department_id = d.id
            LEFT JOIN (
                SELECT equipment_id, SUM(total_cost) as maintenance_cost
                FROM maintenance_work_orders
                WHERE status = 'COMPLETED'
                GROUP BY equipment_id
            ) m ON m.equipment_id = e.id
            LEFT JOIN (
                SELECT equipment_id, COUNT(id) as booking_count
                FROM bookings
                WHERE booking_status IN ('APPROVED', 'CONFIRMED', 'IN_USE', 'COMPLETED')
                GROUP BY equipment_id
            ) b ON b.equipment_id = e.id
            WHERE d.institution_id = ?
            ORDER BY e.equipment_name
            """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> buildLifecycleFromRow(rs), institutionId);
    }

    private List<EquipmentLifecycle> buildEquipmentLifecyclesByDepartment(Long departmentId) {
        String sql = """
            SELECT e.id, e.equipment_name, e.equipment_code, e.purchase_cost,
                   e.purchase_date, e.warranty_expiry, e.status,
                   COALESCE(m.maintenance_cost, 0) as maintenance_cost,
                   COALESCE(b.booking_count, 0) as booking_count
            FROM equipment e
            INNER JOIN laboratories l ON e.laboratory_id = l.id
            LEFT JOIN (
                SELECT equipment_id, SUM(total_cost) as maintenance_cost
                FROM maintenance_work_orders
                WHERE status = 'COMPLETED'
                GROUP BY equipment_id
            ) m ON m.equipment_id = e.id
            LEFT JOIN (
                SELECT equipment_id, COUNT(id) as booking_count
                FROM bookings
                WHERE booking_status IN ('APPROVED', 'CONFIRMED', 'IN_USE', 'COMPLETED')
                GROUP BY equipment_id
            ) b ON b.equipment_id = e.id
            WHERE l.department_id = ?
            ORDER BY e.equipment_name
            """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> buildLifecycleFromRow(rs), departmentId);
    }

    private EquipmentLifecycleResponse buildLifecycleResponse(List<EquipmentLifecycle> lifecycles) {
        List<ProcurementRecommendation> recommendations = buildProcurementRecommendations(lifecycles);
        BigDecimal totalAssetValue = lifecycles.stream()
                .map(EquipmentLifecycle::getPurchaseCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalMaintenanceCost = lifecycles.stream()
                .map(EquipmentLifecycle::getMaintenanceCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        double avgLifecycle = lifecycles.isEmpty() ? 0 :
                lifecycles.stream().mapToInt(EquipmentLifecycle::getAgeMonths).average().orElse(0);

        return EquipmentLifecycleResponse.builder()
                .equipmentLifecycles(lifecycles)
                .procurementRecommendations(recommendations)
                .totalAssetValue(totalAssetValue)
                .totalMaintenanceCost(totalMaintenanceCost)
                .averageLifecycleMonths(Math.round(avgLifecycle * 100.0) / 100.0)
                .build();
    }

    private EquipmentLifecycle buildLifecycleFromRow(java.sql.ResultSet rs) throws java.sql.SQLException {
        BigDecimal purchaseCost = rs.getBigDecimal("purchase_cost") != null ? rs.getBigDecimal("purchase_cost") : BigDecimal.ZERO;
        BigDecimal maintenanceCost = rs.getBigDecimal("maintenance_cost") != null ? rs.getBigDecimal("maintenance_cost") : BigDecimal.ZERO;
        BigDecimal tco = purchaseCost.add(maintenanceCost);

        int bookingCount = rs.getInt("booking_count");
        long revenueEstimate = (long) bookingCount * 50L;
        double roi = tco.compareTo(BigDecimal.ZERO) > 0
                ? Math.round((double) revenueEstimate / tco.doubleValue() * 100.0) / 100.0
                : 0;

        LocalDate purchaseDate = rs.getDate("purchase_date") != null ? rs.getDate("purchase_date").toLocalDate() : null;
        int ageMonths = purchaseDate != null ? (int) ChronoUnit.MONTHS.between(purchaseDate, LocalDate.now()) : 0;

        LocalDate warrantyExpiry = rs.getDate("warranty_expiry") != null ? rs.getDate("warranty_expiry").toLocalDate() : null;
        boolean warrantyExpired = warrantyExpiry != null && warrantyExpiry.isBefore(LocalDate.now());

        String condition = determineCondition(ageMonths, maintenanceCost, purchaseCost);

        return EquipmentLifecycle.builder()
                .equipmentId(rs.getLong("id"))
                .equipmentName(rs.getString("equipment_name"))
                .equipmentCode(rs.getString("equipment_code"))
                .purchaseCost(purchaseCost)
                .maintenanceCost(maintenanceCost)
                .totalCostOfOwnership(tco)
                .roi(roi)
                .ageMonths(ageMonths)
                .purchaseDate(purchaseDate)
                .warrantyExpiry(warrantyExpiry)
                .warrantyExpired(warrantyExpired)
                .condition(condition)
                .totalBookings(bookingCount)
                .build();
    }

    private String determineCondition(int ageMonths, BigDecimal maintenanceCost, BigDecimal purchaseCost) {
        if (purchaseCost == null || purchaseCost.compareTo(BigDecimal.ZERO) == 0) return "UNKNOWN";
        double maintRatio = maintenanceCost.divide(purchaseCost, 4, RoundingMode.HALF_UP).doubleValue();
        if (ageMonths > 84 || maintRatio > 0.5) return "POOR";
        if (ageMonths > 60 || maintRatio > 0.3) return "FAIR";
        if (ageMonths > 36 || maintRatio > 0.15) return "GOOD";
        return "EXCELLENT";
    }

    private List<ProcurementRecommendation> buildProcurementRecommendations(List<EquipmentLifecycle> lifecycles) {
        List<ProcurementRecommendation> recommendations = new ArrayList<>();

        for (EquipmentLifecycle lifecycle : lifecycles) {
            boolean warrantyExpired = lifecycle.isWarrantyExpired();
            boolean highMaintenance = lifecycle.getMaintenanceCost().compareTo(BigDecimal.ZERO) > 0
                    && lifecycle.getPurchaseCost().compareTo(BigDecimal.ZERO) > 0
                    && lifecycle.getMaintenanceCost().divide(lifecycle.getPurchaseCost(), 4, RoundingMode.HALF_UP).doubleValue() > 0.3;
            boolean endOfLife = lifecycle.getAgeMonths() > 84;
            boolean lowUtilization = lifecycle.getTotalBookings() < 5;

            if (lowUtilization) {
                recommendations.add(buildRecommendation(lifecycle, "LOW_UTILIZATION",
                        "Consider reallocating or decommissioning due to low usage",
                        "LOW"));
            }
            if (highMaintenance) {
                recommendations.add(buildRecommendation(lifecycle, "HIGH_MAINTENANCE",
                        "Maintenance costs exceed 30% of purchase price - consider replacement",
                        "HIGH"));
            }
            if (warrantyExpired && lifecycle.getAgeMonths() > 36) {
                recommendations.add(buildRecommendation(lifecycle, "WARRANTY_EXPIRED",
                        "Warranty has expired - evaluate extended warranty or replacement",
                        "MEDIUM"));
            }
            if (endOfLife) {
                recommendations.add(buildRecommendation(lifecycle, "END_OF_LIFE",
                        "Equipment exceeds 7-year lifecycle - schedule replacement",
                        "HIGH"));
            }
        }

        return recommendations;
    }

    private ProcurementRecommendation buildRecommendation(EquipmentLifecycle lifecycle, String reason,
                                                           String recommendation, String priority) {
        return ProcurementRecommendation.builder()
                .equipmentId(lifecycle.getEquipmentId())
                .equipmentName(lifecycle.getEquipmentName())
                .equipmentCode(lifecycle.getEquipmentCode())
                .reason(reason)
                .currentCost(lifecycle.getTotalCostOfOwnership())
                .recommendation(recommendation)
                .priority(priority)
                .build();
    }
}
