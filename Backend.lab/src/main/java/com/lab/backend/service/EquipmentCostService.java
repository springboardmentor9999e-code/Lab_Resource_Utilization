package com.lab.backend.service;

import com.lab.backend.dto.*;
import com.lab.backend.entity.EquipmentCost;
import com.lab.backend.repository.EquipmentCostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EquipmentCostService {

    private final EquipmentCostRepository equipmentCostRepository;

    // ============ EQUIPMENT COST OPERATIONS ============

    public EquipmentCostResponse createEquipmentCost(EquipmentCostRequest request) {
        EquipmentCost equipmentCost = new EquipmentCost();
        equipmentCost.setEquipmentName(request.getEquipmentName());
        equipmentCost.setEquipmentCode(request.getEquipmentCode());
        equipmentCost.setDepartment(request.getDepartment());
        equipmentCost.setMonthlyCost(request.getMonthlyCost());
        equipmentCost.setCostEffectiveDate(request.getCostEffectiveDate());
        equipmentCost.setDescription(request.getDescription());

        EquipmentCost saved = equipmentCostRepository.save(equipmentCost);
        return mapToResponse(saved);
    }

    public EquipmentCostResponse updateEquipmentCost(Long id, EquipmentCostRequest request) {
        EquipmentCost equipmentCost = equipmentCostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found with id: " + id));

        equipmentCost.setEquipmentName(request.getEquipmentName());
        equipmentCost.setEquipmentCode(request.getEquipmentCode());
        equipmentCost.setDepartment(request.getDepartment());
        equipmentCost.setMonthlyCost(request.getMonthlyCost());
        equipmentCost.setCostEffectiveDate(request.getCostEffectiveDate());
        equipmentCost.setDescription(request.getDescription());

        EquipmentCost updated = equipmentCostRepository.save(equipmentCost);
        return mapToResponse(updated);
    }

    public EquipmentCostResponse getEquipmentCostById(Long id) {
        EquipmentCost equipmentCost = equipmentCostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found with id: " + id));
        return mapToResponse(equipmentCost);
    }

    public List<EquipmentCostResponse> getAllEquipmentCosts() {
        return equipmentCostRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<EquipmentCostResponse> getActiveEquipmentCosts() {
        return equipmentCostRepository.findByStatus("ACTIVE")
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<EquipmentCostResponse> getEquipmentCostsByDepartment(String department) {
        return equipmentCostRepository.findByDepartmentAndStatus(department, "ACTIVE")
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void deleteEquipmentCost(Long id) {
        EquipmentCost equipmentCost = equipmentCostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found with id: " + id));
        equipmentCost.setStatus("INACTIVE");
        equipmentCostRepository.save(equipmentCost);
    }

    // ============ DEPARTMENT COST OPERATIONS ============

    public List<DepartmentCostResponse> getDepartmentCosts() {
        List<Object[]> results = equipmentCostRepository.getDepartmentCosts();
        List<EquipmentCost> allEquipments = equipmentCostRepository.findByStatus("ACTIVE");

        return results.stream().map(row -> {
            String department = (String) row[0];
            BigDecimal totalCost = (BigDecimal) row[1];

            long equipmentCount = allEquipments.stream()
                    .filter(e -> e.getDepartment().equals(department))
                    .count();

            BigDecimal avgCost = equipmentCount > 0 
                    ? totalCost.divide(BigDecimal.valueOf(equipmentCount), 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            return new DepartmentCostResponse(department, totalCost, (int) equipmentCount, avgCost);
        }).collect(Collectors.toList());
    }

    public DepartmentCostResponse getDepartmentCostByName(String department) {
        Optional<Object[]> result = equipmentCostRepository.getDepartmentCostByName(department);

        if (result.isPresent()) {
            Object[] row = result.get();
            String deptName = (String) row[0];
            BigDecimal totalCost = (BigDecimal) row[1];

            List<EquipmentCost> equipments = equipmentCostRepository
                    .findByDepartmentAndStatus(department, "ACTIVE");

            int count = equipments.size();
            BigDecimal avgCost = count > 0 
                    ? totalCost.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            return new DepartmentCostResponse(deptName, totalCost, count, avgCost);
        }
        throw new RuntimeException("Department not found: " + department);
    }

    // ============ MONTHLY COST OPERATIONS ============

    public TotalMonthlyCostResponse getTotalMonthlyCost() {
        BigDecimal totalMonthlyCost = equipmentCostRepository.getTotalMonthlyCost();
        List<EquipmentCost> activeEquipments = equipmentCostRepository.findByStatus("ACTIVE");
        Set<String> departments = activeEquipments.stream()
                .map(EquipmentCost::getDepartment)
                .collect(Collectors.toSet());

        return new TotalMonthlyCostResponse(
                totalMonthlyCost != null ? totalMonthlyCost : BigDecimal.ZERO,
                activeEquipments.size(),
                departments.size()
        );
    }

    public MonthlyCostResponse getMonthlyCostByDepartment(String department) {
        BigDecimal cost = equipmentCostRepository.getMonthlyCostByDepartment(department);
        return new MonthlyCostResponse(
                department,
                cost != null ? cost : BigDecimal.ZERO
        );
    }

    public List<MonthlyCostResponse> getAllMonthlyCostsByDepartment() {
        return equipmentCostRepository.findByStatus("ACTIVE")
                .stream()
                .collect(Collectors.groupingBy(
                        EquipmentCost::getDepartment,
                        Collectors.reducing(
                                BigDecimal.ZERO,
                                EquipmentCost::getMonthlyCost,
                                BigDecimal::add
                        )
                ))
                .entrySet()
                .stream()
                .map(entry -> new MonthlyCostResponse(entry.getKey(), entry.getValue()))
                .sorted(Comparator.comparing(MonthlyCostResponse::getMonthlyCost).reversed())
                .collect(Collectors.toList());
    }

    // ============ BILLING OPERATIONS ============

    public List<BillingMonthlyResponse> getBillingByMonth() {
        List<Object[]> results = equipmentCostRepository.getBillingByMonth();

        return results.stream().map(row -> {
            Integer year = ((Number) row[0]).intValue();
            Integer month = ((Number) row[1]).intValue();
            BigDecimal cost = (BigDecimal) row[2];
            String monthYear = YearMonth.of(year, month).toString();

            return new BillingMonthlyResponse(year, month, cost, monthYear);
        }).collect(Collectors.toList());
    }

    public List<BillingYearlyResponse> getBillingByYear() {
        List<Object[]> results = equipmentCostRepository.getBillingByYear();

        return results.stream().map(row -> {
            Integer year = ((Number) row[0]).intValue();
            BigDecimal cost = (BigDecimal) row[1];
            return new BillingYearlyResponse(year, cost);
        }).collect(Collectors.toList());
    }

    public List<BillingDepartmentResponse> getBillingByDateRange(LocalDate startDate, LocalDate endDate) {
        List<EquipmentCost> equipments = equipmentCostRepository.getBillingByDateRange(startDate, endDate);

        return equipments.stream()
                .collect(Collectors.groupingBy(
                        EquipmentCost::getDepartment,
                        Collectors.reducing(
                                BigDecimal.ZERO,
                                EquipmentCost::getMonthlyCost,
                                BigDecimal::add
                        )
                ))
                .entrySet()
                .stream()
                .map(entry -> new BillingDepartmentResponse(
                        entry.getKey(),
                        entry.getValue(),
                        startDate + " to " + endDate
                ))
                .collect(Collectors.toList());
    }

    public Map<String, Object> generateBillingReport(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> report = new LinkedHashMap<>();

        List<Object[]> departmentBilling = equipmentCostRepository
                .getBillingByDepartmentAndDateRange(startDate, endDate);

        BigDecimal totalBilling = departmentBilling.stream()
                .map(row -> (BigDecimal) row[1])
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        report.put("period", startDate + " to " + endDate);
        report.put("totalBilling", totalBilling);
        report.put("departmentBreakdown", departmentBilling.stream()
                .map(row -> new HashMap<String, Object>() {{
                    put("department", row[0]);
                    put("cost", row[1]);
                }})
                .collect(Collectors.toList()));
        report.put("generatedAt", new Date());

        return report;
    }

    public Map<String, Object> getBillingAnalytics() {
        Map<String, Object> analytics = new LinkedHashMap<>();

        BigDecimal totalMonthly = equipmentCostRepository.getTotalMonthlyCost();
        analytics.put("totalMonthlyCost", totalMonthly != null ? totalMonthly : BigDecimal.ZERO);

        BigDecimal annualProjection = totalMonthly != null 
                ? totalMonthly.multiply(BigDecimal.valueOf(12))
                : BigDecimal.ZERO;
        analytics.put("annualProjection", annualProjection);

        analytics.put("departmentCosts", getDepartmentCosts());
        analytics.put("billingTrend", getBillingByMonth().stream()
                .limit(12)
                .collect(Collectors.toList()));

        return analytics;
    }

    private EquipmentCostResponse mapToResponse(EquipmentCost equipmentCost) {
        return new EquipmentCostResponse(
                equipmentCost.getId(),
                equipmentCost.getEquipmentName(),
                equipmentCost.getEquipmentCode(),
                equipmentCost.getDepartment(),
                equipmentCost.getMonthlyCost(),
                equipmentCost.getCostEffectiveDate(),
                equipmentCost.getDescription(),
                equipmentCost.getStatus(),
                equipmentCost.getCreatedAt(),
                equipmentCost.getUpdatedAt()
        );
    }
}
