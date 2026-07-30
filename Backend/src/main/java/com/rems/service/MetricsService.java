package com.rems.service;

import com.rems.entity.Department;
import com.rems.entity.Equipment;
import com.rems.entity.EquipmentDemandMetric;
import com.rems.entity.UtilizationMetric;
import com.rems.entity.User;
import com.rems.repository.DepartmentRepository;
import com.rems.repository.EquipmentDemandMetricRepository;
import com.rems.repository.EquipmentRepository;
import com.rems.repository.UtilizationMetricRepository;
import com.rems.repository.UserRepository;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MetricsService {

    private final EquipmentRepository equipmentRepository;
    private final DepartmentRepository departmentRepository;
    private final UtilizationMetricRepository utilizationMetricRepository;
    private final EquipmentDemandMetricRepository equipmentDemandMetricRepository;
    private final UserRepository userRepository;

    @Value("${app.demand.thresholds.quadrant-utilization:0.60}")
    private double thresholdQuadrantUtilization;

    @Value("${app.demand.thresholds.quadrant-demand:0.50}")
    private double thresholdQuadrantDemand;

    @Getter
    @Setter
    @Builder
    public static class DailyUtilization {
        private LocalDate date;
        private Double usedHours;
        private Double availableHours;
        private Double utilizationRate;
    }

    @Getter
    @Setter
    @Builder
    public static class HeatmapData {
        private Long departmentId;
        private String departmentName;
        private List<LocalDate> dates;
        private List<EquipmentHeatmapRow> equipmentMetrics;
    }

    @Getter
    @Setter
    @Builder
    public static class EquipmentHeatmapRow {
        private Long equipmentId;
        private String equipmentName;
        private String category;
        private String labName;
        private List<Double> dailyRates; // same size as dates, null for unavailable
    }

    @Getter
    @Setter
    @Builder
    public static class DemandMetricResponse {
        private Long equipmentId;
        private String equipmentName;
        private String periodType;
        private String labName;
        private Long bookingRequests;
        private Long rejectedBookings;
        private Long waitlistEntries;
        private Double avgWaitlistWaitHours;
        private Double avgLeadTimeHours;
        private Double demandScore;
    }

    @Getter
    @Setter
    @Builder
    public static class QuadrantPoint {
        private Long equipmentId;
        private String equipmentName;
        private String category;
        private String labName;
        private Double utilizationRate; // average of last 30 days
        private Double demandScore; // latest 30d demand score
        private String quadrant; // e.g. "Procurement Candidate", "Efficiently Used", "Scheduling/Access Problem", "Underused Asset"
    }

    public List<DailyUtilization> getEquipmentUtilization(Long equipmentId, String range) {
        int days = parseRange(range);
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(days - 1);

        List<UtilizationMetric> metrics = utilizationMetricRepository
                .findByEquipmentEquipmentIdAndDateBetweenOrderByDateAsc(equipmentId, start, end);

        return metrics.stream()
                .map(m -> DailyUtilization.builder()
                        .date(m.getDate())
                        .usedHours(m.getUsedHours())
                        .availableHours(m.getAvailableHours())
                        .utilizationRate(m.getUtilizationRate())
                        .build())
                .toList();
    }

    public HeatmapData getDepartmentUtilizationHeatmap(Long departmentId, String range) {
        int days = parseRange(range);
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(days - 1);

        Department dept = departmentRepository.findById(departmentId).orElse(null);
        String deptName = dept != null ? dept.getName() : "Unknown Department";

        // Generate full date series
        List<LocalDate> dates = new ArrayList<>();
        LocalDate curr = start;
        while (!curr.isAfter(end)) {
            dates.add(curr);
            curr = curr.plusDays(1);
        }

        // Fetch authorized equipment for this department (filtered by lab for Lab Managers/Technicians)
        List<Equipment> equipments = getAuthorizedEquipmentsForDepartment(departmentId);

        List<EquipmentHeatmapRow> rows = new ArrayList<>();

        for (Equipment eq : equipments) {
            List<UtilizationMetric> metrics = utilizationMetricRepository
                    .findByEquipmentEquipmentIdAndDateBetweenOrderByDateAsc(eq.getEquipmentId(), start, end);

            Map<LocalDate, Double> ratesByDate = new HashMap<>();
            for (UtilizationMetric m : metrics) {
                ratesByDate.put(m.getDate(), m.getUtilizationRate());
            }

            List<Double> dailyRates = new ArrayList<>();
            for (LocalDate date : dates) {
                // If it doesn't exist in ratesByDate, it will add null
                dailyRates.add(ratesByDate.get(date));
            }

            rows.add(EquipmentHeatmapRow.builder()
                    .equipmentId(eq.getEquipmentId())
                    .equipmentName(eq.getName())
                    .category(eq.getCategory())
                    .labName(eq.getLab() != null ? eq.getLab().getName() : "Unknown Lab")
                    .dailyRates(dailyRates)
                    .build());
        }

        return HeatmapData.builder()
                .departmentId(departmentId)
                .departmentName(deptName)
                .dates(dates)
                .equipmentMetrics(rows)
                .build();
    }

    public DemandMetricResponse getEquipmentDemand(Long equipmentId, String range) {
        String periodType = range.equalsIgnoreCase("7d") ? "7d" : "30d";
        Optional<EquipmentDemandMetric> opt = equipmentDemandMetricRepository
                .findTopByEquipmentEquipmentIdAndPeriodTypeOrderByPeriodEndDesc(equipmentId, periodType);

        if (opt.isPresent()) {
            EquipmentDemandMetric m = opt.get();
            return DemandMetricResponse.builder()
                    .equipmentId(m.getEquipment().getEquipmentId())
                    .equipmentName(m.getEquipment().getName())
                    .periodType(m.getPeriodType())
                    .labName(m.getEquipment().getLab() != null ? m.getEquipment().getLab().getName() : "Unknown Lab")
                    .bookingRequests(m.getBookingRequests())
                    .rejectedBookings(m.getRejectedBookings())
                    .waitlistEntries(m.getWaitlistEntries())
                    .avgWaitlistWaitHours(m.getAvgWaitlistWaitHours())
                    .avgLeadTimeHours(m.getAvgLeadTimeHours())
                    .demandScore(m.getDemandScore())
                    .build();
        }

        // Return empty mock/zero structure if none exists
        Equipment eq = equipmentRepository.findById(equipmentId).orElse(null);
        return DemandMetricResponse.builder()
                .equipmentId(equipmentId)
                .equipmentName(eq != null ? eq.getName() : "Unknown")
                .periodType(periodType)
                .labName(eq != null && eq.getLab() != null ? eq.getLab().getName() : "Unknown Lab")
                .bookingRequests(0L)
                .rejectedBookings(0L)
                .waitlistEntries(0L)
                .avgWaitlistWaitHours(0.0)
                .avgLeadTimeHours(0.0)
                .demandScore(0.0)
                .build();
    }

    public List<DemandMetricResponse> getDemandRanking(String scope, Long scopeId, String category, String range) {
        String periodType = range.equalsIgnoreCase("7d") ? "7d" : "30d";
        List<EquipmentDemandMetric> allMetrics = equipmentDemandMetricRepository.findByPeriodType(periodType);

        // Filter to latest entries only (group by equipment and keep max periodEnd)
        Map<Long, EquipmentDemandMetric> latestByEq = new HashMap<>();
        for (EquipmentDemandMetric m : allMetrics) {
            EquipmentDemandMetric existing = latestByEq.get(m.getEquipment().getEquipmentId());
            if (existing == null || m.getPeriodEnd().isAfter(existing.getPeriodEnd())) {
                latestByEq.put(m.getEquipment().getEquipmentId(), m);
            }
        }

        List<EquipmentDemandMetric> filtered = new ArrayList<>(latestByEq.values());

        // Filter by scope
        if (scope.equalsIgnoreCase("institution") && scopeId != null) {
            filtered = filtered.stream()
                    .filter(m -> m.getEquipment().getInstitution().getInstitutionId().equals(scopeId))
                    .toList();
        } else if (scope.equalsIgnoreCase("department") && scopeId != null) {
            filtered = filtered.stream()
                    .filter(m -> m.getEquipment().getDepartment() != null && m.getEquipment().getDepartment().getDepartmentId().equals(scopeId))
                    .toList();
        }

        // Filter by user's lab visibility constraints (Lab Manager / Lab Tech)
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String userEmail = auth != null ? auth.getName() : null;
        User user = null;
        if (userEmail != null && !userEmail.equals("anonymousUser") && userRepository != null) {
            user = userRepository.findByEmail(userEmail).orElse(null);
        }
        if (user != null && auth != null) {
            java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> authorities = auth.getAuthorities();
            boolean isLabManager = authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_LAB_MANAGER"));
            boolean isLabTech = authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_LAB_TECHNICIAN"));
            if ((isLabManager || isLabTech) && user.getLab() != null) {
                Long userLabId = user.getLab().getLabId();
                filtered = filtered.stream()
                        .filter(m -> m.getEquipment().getLab() != null && m.getEquipment().getLab().getLabId().equals(userLabId))
                        .toList();
            }
        }

        // Filter by category
        if (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("all")) {
            filtered = filtered.stream()
                    .filter(m -> m.getEquipment().getCategory() != null && m.getEquipment().getCategory().equalsIgnoreCase(category))
                    .toList();
        }

        // Sort descending by score
        return filtered.stream()
                .map(m -> DemandMetricResponse.builder()
                        .equipmentId(m.getEquipment().getEquipmentId())
                        .equipmentName(m.getEquipment().getName())
                        .periodType(m.getPeriodType())
                        .labName(m.getEquipment().getLab() != null ? m.getEquipment().getLab().getName() : "Unknown Lab")
                        .bookingRequests(m.getBookingRequests())
                        .rejectedBookings(m.getRejectedBookings())
                        .waitlistEntries(m.getWaitlistEntries())
                        .avgWaitlistWaitHours(m.getAvgWaitlistWaitHours())
                        .avgLeadTimeHours(m.getAvgLeadTimeHours())
                        .demandScore(m.getDemandScore())
                        .build())
                .sorted(Comparator.comparingDouble(DemandMetricResponse::getDemandScore).reversed())
                .toList();
    }

    public List<QuadrantPoint> getQuadrantData(Long departmentId) {
        // Fetch authorized equipment for department (filtered by lab for Lab Managers/Technicians)
        List<Equipment> equipments = getAuthorizedEquipmentsForDepartment(departmentId);

        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(29); // 30-day window

        List<QuadrantPoint> points = new ArrayList<>();

        for (Equipment eq : equipments) {
            // Get average utilization rate over last 30 days
            List<UtilizationMetric> metrics = utilizationMetricRepository
                    .findByEquipmentEquipmentIdAndDateBetweenOrderByDateAsc(eq.getEquipmentId(), start, end);

            double sum = 0.0;
            int count = 0;
            for (UtilizationMetric m : metrics) {
                if (m.getUtilizationRate() != null) {
                    sum += m.getUtilizationRate();
                    count++;
                }
            }
            double avgUtil = count > 0 ? (sum / count) : 0.0;

            // Get latest 30d demand score
            Optional<EquipmentDemandMetric> optDemand = equipmentDemandMetricRepository
                    .findTopByEquipmentEquipmentIdAndPeriodTypeOrderByPeriodEndDesc(eq.getEquipmentId(), "30d");
            double demandScore = optDemand.isPresent() ? optDemand.get().getDemandScore() : 0.0;

            // Determine quadrant
            String quadrant;
            if (avgUtil >= thresholdQuadrantUtilization) {
                if (demandScore >= thresholdQuadrantDemand) {
                    quadrant = "Procurement Candidate";
                } else {
                    quadrant = "Efficiently Used";
                }
            } else {
                if (demandScore >= thresholdQuadrantDemand) {
                    quadrant = "Scheduling/Access Problem";
                } else {
                    quadrant = "Underused Asset";
                }
            }

            points.add(QuadrantPoint.builder()
                    .equipmentId(eq.getEquipmentId())
                    .equipmentName(eq.getName())
                    .category(eq.getCategory())
                    .labName(eq.getLab() != null ? eq.getLab().getName() : "Unknown Lab")
                    .utilizationRate(avgUtil)
                    .demandScore(demandScore)
                    .quadrant(quadrant)
                    .build());
        }

        return points;
    }

    private List<Equipment> getAuthorizedEquipmentsForDepartment(Long departmentId) {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String userEmail = auth != null ? auth.getName() : null;
        User user = null;
        if (userEmail != null && !userEmail.equals("anonymousUser") && userRepository != null) {
            user = userRepository.findByEmail(userEmail).orElse(null);
        }

        List<Equipment> allDeptEquipments = equipmentRepository.findAll().stream()
                .filter(e -> e.getDepartment() != null && e.getDepartment().getDepartmentId().equals(departmentId))
                .toList();

        if (user == null || auth == null) {
            return allDeptEquipments;
        }

        java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> authorities = auth.getAuthorities();
        boolean isLabManager = authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_LAB_MANAGER"));
        boolean isLabTech = authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_LAB_TECHNICIAN"));

        if ((isLabManager || isLabTech) && user.getLab() != null) {
            Long userLabId = user.getLab().getLabId();
            return allDeptEquipments.stream()
                    .filter(e -> e.getLab() != null && e.getLab().getLabId().equals(userLabId))
                    .toList();
        }

        return allDeptEquipments;
    }

    private int parseRange(String range) {
        if (range == null) return 30;
        try {
            return Integer.parseInt(range.replaceAll("[^0-9]", ""));
        } catch (Exception e) {
            return 30;
        }
    }
}
