package com.lrplatform.service;

import com.lrplatform.dto.request.CostAllocationRequest;
import com.lrplatform.dto.response.BudgetSummaryResponse;
import com.lrplatform.dto.response.CostBreakdownResponse;
import com.lrplatform.dto.response.EquipmentUsageChargesResponse;
import com.lrplatform.exception.ResourceNotFoundException;
import com.lrplatform.model.entity.*;
import com.lrplatform.model.enums.PaymentStatus;
import com.lrplatform.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
@SuppressWarnings("null")
public class CostTrackingService {

    private final InvoiceRepository invoiceRepository;
    private final DepartmentRepository departmentRepository;
    private final InstitutionRepository institutionRepository;
    private final SharedEquipmentRepository sharedEquipmentRepository;
    private final DepartmentBudgetRepository budgetRepository;
    private final UsageLogRepository usageLogRepository;

    public CostBreakdownResponse getCostBreakdown(CostAllocationRequest request) {
        List<Invoice> invoices = fetchFilteredInvoices(request);
        return buildCostBreakdown(invoices);
    }

    public CostBreakdownResponse getCostBreakdownByDepartment(Long departmentId) {
        if (!departmentRepository.existsById(departmentId)) {
            throw new ResourceNotFoundException("Department not found with id: " + departmentId);
        }
        List<Invoice> invoices = invoiceRepository.findAll().stream()
                .filter(inv -> inv.getBooking() != null
                        && inv.getBooking().getEquipment() != null
                        && inv.getBooking().getEquipment().getLaboratory() != null
                        && inv.getBooking().getEquipment().getLaboratory().getDepartment() != null
                        && inv.getBooking().getEquipment().getLaboratory().getDepartment().getId().equals(departmentId))
                .toList();
        return buildCostBreakdown(invoices);
    }

    public CostBreakdownResponse getCostBreakdownByInstitution(Long institutionId) {
        if (!institutionRepository.existsById(institutionId)) {
            throw new ResourceNotFoundException("Institution not found with id: " + institutionId);
        }
        List<Invoice> invoices = invoiceRepository.findByInstitutionIdOrderByGeneratedAtDesc(institutionId,
                org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE)).getContent();
        return buildCostBreakdown(invoices);
    }

    public List<EquipmentUsageChargesResponse> getEquipmentUsageCharges(Long institutionId, Long departmentId,
                                                                        LocalDate dateFrom, LocalDate dateTo) {
        List<UsageLog> logs = fetchUsageLogs(institutionId, dateFrom, dateTo);

        if (departmentId != null) {
            logs = logs.stream()
                    .filter(l -> l.getEquipment() != null
                            && l.getEquipment().getLaboratory() != null
                            && l.getEquipment().getLaboratory().getDepartment() != null
                            && l.getEquipment().getLaboratory().getDepartment().getId().equals(departmentId))
                    .toList();
        }

        Map<Long, List<UsageLog>> grouped = logs.stream()
                .collect(Collectors.groupingBy(l -> l.getEquipment().getId()));

        List<EquipmentUsageChargesResponse> result = new ArrayList<>();
        for (Map.Entry<Long, List<UsageLog>> entry : grouped.entrySet()) {
            List<UsageLog> eqLogs = entry.getValue();
            Equipment equipment = eqLogs.get(0).getEquipment();
            BigDecimal rate = equipment.getHourlyRate() != null ? equipment.getHourlyRate() : equipment.getPurchaseCost();
            long totalMinutes = eqLogs.stream().mapToLong(UsageLog::getMinutes).sum();
            BigDecimal totalHours = BigDecimal.valueOf(totalMinutes)
                    .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
            BigDecimal totalCharge = rate != null
                    ? totalHours.multiply(rate).setScale(2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            result.add(EquipmentUsageChargesResponse.builder()
                    .equipmentId(equipment.getId())
                    .equipmentName(equipment.getEquipmentName())
                    .equipmentCode(equipment.getEquipmentCode())
                    .totalHours(totalHours)
                    .hourlyRate(rate)
                    .totalCharge(totalCharge)
                    .bookingCount(eqLogs.size())
                    .build());
        }

        result.sort(Comparator.comparing(EquipmentUsageChargesResponse::getTotalCharge, Comparator.nullsLast(Comparator.reverseOrder())));
        return result;
    }

    private List<UsageLog> fetchUsageLogs(Long institutionId, LocalDate dateFrom, LocalDate dateTo) {
        LocalDateTime from = dateFrom != null ? dateFrom.atStartOfDay() : null;
        LocalDateTime to = dateTo != null ? dateTo.atTime(LocalTime.MAX) : null;

        if (institutionId != null && from != null && to != null) {
            return usageLogRepository.findByInstitutionIdAndStartTimeGreaterThanEqualAndEndTimeLessThanEqual(institutionId, from, to);
        }
        if (institutionId != null) {
            return usageLogRepository.findByInstitutionIdOrderByStartTimeDesc(institutionId);
        }
        if (from != null && to != null) {
            return usageLogRepository.findByStartTimeGreaterThanEqualAndEndTimeLessThanEqual(from, to);
        }
        return usageLogRepository.findAll();
    }

    public BudgetSummaryResponse getBudgetSummary() {
        return buildBudgetSummary(departmentRepository.findAll());
    }

    public BudgetSummaryResponse getBudgetSummaryByInstitution(Long institutionId) {
        List<Department> departments = departmentRepository.findByInstitutionId(institutionId);
        return buildBudgetSummary(departments);
    }

    public BudgetSummaryResponse getBudgetSummaryByDepartment(Long departmentId) {
        Department dept = departmentRepository.findById(departmentId).orElse(null);
        if (dept == null) return BudgetSummaryResponse.builder()
                .totalBudget(BigDecimal.ZERO).totalSpent(BigDecimal.ZERO)
                .totalRemaining(BigDecimal.ZERO).utilizationPercent(0.0)
                .departmentBudgets(List.of()).build();
        return buildBudgetSummary(List.of(dept));
    }

    private BudgetSummaryResponse buildBudgetSummary(List<Department> departments) {
        int currentYear = LocalDate.now().getYear();
        List<BudgetSummaryResponse.DepartmentBudget> deptBudgets = new ArrayList<>();
        BigDecimal totalBudget = BigDecimal.ZERO;
        BigDecimal totalSpent = BigDecimal.ZERO;

        for (Department dept : departments) {
            List<Invoice> deptInvoices = getInvoicesForDepartment(dept.getId());
            BigDecimal spent = deptInvoices.stream()
                    .map(Invoice::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            long invoiceCount = deptInvoices.size();
            totalSpent = totalSpent.add(spent);

            BigDecimal budgetAmount = budgetRepository.findByDepartmentIdAndFiscalYear(dept.getId(), currentYear)
                    .map(b -> b.getBudgetAmount())
                    .orElse(BigDecimal.ZERO);
            totalBudget = totalBudget.add(budgetAmount);

            BigDecimal remaining = budgetAmount.subtract(spent);
            double utilPercent = budgetAmount.compareTo(BigDecimal.ZERO) > 0
                    ? spent.multiply(BigDecimal.valueOf(100))
                    .divide(budgetAmount, 2, RoundingMode.HALF_UP).doubleValue()
                    : 0.0;

            deptBudgets.add(BudgetSummaryResponse.DepartmentBudget.builder()
                    .departmentId(dept.getId())
                    .departmentName(dept.getDepartmentName())
                    .budgetAmount(budgetAmount)
                    .spentAmount(spent)
                    .remaining(remaining)
                    .utilizationPercent(utilPercent)
                    .invoiceCount((int) invoiceCount)
                    .build());
        }

        return BudgetSummaryResponse.builder()
                .totalBudget(totalBudget)
                .totalSpent(totalSpent)
                .totalRemaining(totalBudget.subtract(totalSpent))
                .utilizationPercent(totalBudget.compareTo(BigDecimal.ZERO) > 0
                        ? totalSpent.multiply(BigDecimal.valueOf(100))
                        .divide(totalBudget, 2, RoundingMode.HALF_UP).doubleValue()
                        : 0.0)
                .departmentBudgets(deptBudgets)
                .build();
    }

    public List<Map<String, Object>> getMonthlyRevenue(int year) {
        List<Object[]> results = invoiceRepository.monthlyRevenueByYear(year);
        List<Map<String, Object>> monthlyRevenue = new ArrayList<>();

        for (Object[] row : results) {
            Map<String, Object> monthData = new LinkedHashMap<>();
            monthData.put("month", row[0]);
            monthData.put("revenue", row[1]);
            monthData.put("invoiceCount", row[2]);
            monthlyRevenue.add(monthData);
        }

        return monthlyRevenue;
    }

    public List<Map<String, Object>> getMonthlyRevenueByInstitution(int year, Long institutionId) {
        List<Invoice> allInvoices = invoiceRepository.findByInstitutionIdOrderByGeneratedAtDesc(institutionId,
                org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE)).getContent();
        return buildMonthlyRevenue(year, allInvoices);
    }

    public List<Map<String, Object>> getMonthlyRevenueByDepartment(int year, Long departmentId) {
        List<Invoice> deptInvoices = getInvoicesForDepartment(departmentId);
        return buildMonthlyRevenue(year, deptInvoices);
    }

    private List<Map<String, Object>> buildMonthlyRevenue(int year, List<Invoice> invoices) {
        Map<Integer, Map<String, Object>> monthlyMap = new LinkedHashMap<>();
        for (int m = 1; m <= 12; m++) {
            Map<String, Object> monthData = new LinkedHashMap<>();
            monthData.put("month", m);
            monthData.put("revenue", BigDecimal.ZERO);
            monthData.put("invoiceCount", 0L);
            monthlyMap.put(m, monthData);
        }

        for (Invoice inv : invoices) {
            if (inv.getGeneratedAt() != null && inv.getGeneratedAt().getYear() == year) {
                int month = inv.getGeneratedAt().getMonthValue();
                Map<String, Object> monthData = monthlyMap.get(month);
                if (monthData != null) {
                    BigDecimal currentRevenue = (BigDecimal) monthData.get("revenue");
                    monthData.put("revenue", currentRevenue.add(inv.getTotalAmount() != null ? inv.getTotalAmount() : BigDecimal.ZERO));
                    monthData.put("invoiceCount", ((long) monthData.get("invoiceCount")) + 1);
                }
            }
        }
        return new ArrayList<>(monthlyMap.values());
    }

    private List<Invoice> fetchFilteredInvoices(CostAllocationRequest request) {
        List<Invoice> invoices;

        if (request.getInstitutionId() != null) {
            invoices = invoiceRepository.findByInstitutionIdOrderByGeneratedAtDesc(
                    request.getInstitutionId(),
                    org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE)).getContent();
        } else {
            invoices = invoiceRepository.findAll();
        }

        if (request.getDepartmentId() != null) {
            Long deptId = request.getDepartmentId();
            invoices = invoices.stream()
                    .filter(inv -> inv.getBooking() != null
                            && inv.getBooking().getEquipment() != null
                            && inv.getBooking().getEquipment().getLaboratory() != null
                            && inv.getBooking().getEquipment().getLaboratory().getDepartment() != null
                            && inv.getBooking().getEquipment().getLaboratory().getDepartment().getId().equals(deptId))
                    .toList();
        }

        if (request.getDateFrom() != null) {
            LocalDateTime from = request.getDateFrom().atStartOfDay();
            invoices = invoices.stream()
                    .filter(inv -> inv.getGeneratedAt() != null && !inv.getGeneratedAt().isBefore(from))
                    .toList();
        }

        if (request.getDateTo() != null) {
            LocalDateTime to = request.getDateTo().atTime(LocalTime.MAX);
            invoices = invoices.stream()
                    .filter(inv -> inv.getGeneratedAt() != null && !inv.getGeneratedAt().isAfter(to))
                    .toList();
        }

        return invoices;
    }

    private CostBreakdownResponse buildCostBreakdown(List<Invoice> invoices) {
        BigDecimal totalRevenue = invoices.stream()
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPaid = invoices.stream()
                .filter(inv -> inv.getPaymentStatus() == PaymentStatus.PAID)
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPending = invoices.stream()
                .filter(inv -> inv.getPaymentStatus() == PaymentStatus.PENDING
                        || inv.getPaymentStatus() == PaymentStatus.PARTIALLY_PAID)
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalOverdue = invoices.stream()
                .filter(inv -> inv.getDueDate() != null
                        && inv.getDueDate().isBefore(LocalDate.now())
                        && (inv.getPaymentStatus() == PaymentStatus.PENDING
                        || inv.getPaymentStatus() == PaymentStatus.PARTIALLY_PAID))
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<CostBreakdownResponse.DepartmentCost> departmentCosts = buildDepartmentCosts(invoices);
        List<CostBreakdownResponse.EquipmentCost> equipmentCosts = buildEquipmentCosts(invoices);

        return CostBreakdownResponse.builder()
                .totalRevenue(totalRevenue)
                .totalPaid(totalPaid)
                .totalPending(totalPending)
                .totalOverdue(totalOverdue)
                .departmentCosts(departmentCosts)
                .equipmentCosts(equipmentCosts)
                .build();
    }

    private List<CostBreakdownResponse.DepartmentCost> buildDepartmentCosts(List<Invoice> invoices) {
        Map<Long, List<Invoice>> grouped = invoices.stream()
                .filter(inv -> inv.getBooking() != null
                        && inv.getBooking().getEquipment() != null
                        && inv.getBooking().getEquipment().getLaboratory() != null
                        && inv.getBooking().getEquipment().getLaboratory().getDepartment() != null)
                .collect(Collectors.groupingBy(
                        inv -> inv.getBooking().getEquipment().getLaboratory().getDepartment().getId()));

        List<CostBreakdownResponse.DepartmentCost> deptCosts = new ArrayList<>();

        for (Map.Entry<Long, List<Invoice>> entry : grouped.entrySet()) {
            List<Invoice> deptInvoices = entry.getValue();
            Department dept = deptInvoices.get(0).getBooking().getEquipment().getLaboratory().getDepartment();

            BigDecimal totalCost = deptInvoices.stream()
                    .map(Invoice::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            int bookingCount = (int) deptInvoices.stream()
                    .filter(inv -> inv.getBooking() != null)
                    .count();

            BigDecimal costPerBooking = bookingCount > 0
                    ? totalCost.divide(BigDecimal.valueOf(bookingCount), 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            deptCosts.add(CostBreakdownResponse.DepartmentCost.builder()
                    .departmentId(dept.getId())
                    .departmentName(dept.getDepartmentName())
                    .totalCost(totalCost)
                    .costPerBooking(costPerBooking)
                    .bookingCount(bookingCount)
                    .build());
        }

        return deptCosts;
    }

    private List<CostBreakdownResponse.EquipmentCost> buildEquipmentCosts(List<Invoice> invoices) {
        Map<Long, List<Invoice>> grouped = invoices.stream()
                .filter(inv -> inv.getBooking() != null && inv.getBooking().getEquipment() != null)
                .collect(Collectors.groupingBy(
                        inv -> inv.getBooking().getEquipment().getId()));

        Map<Long, BigDecimal> hourlyRateMap = sharedEquipmentRepository.findBySharingStatus("ACTIVE").stream()
                .collect(Collectors.toMap(
                        se -> se.getEquipment().getId(),
                        se -> se.getHourlyRate() != null ? se.getHourlyRate() : BigDecimal.ZERO,
                        (a, b) -> a));

        List<CostBreakdownResponse.EquipmentCost> eqCosts = new ArrayList<>();

        for (Map.Entry<Long, List<Invoice>> entry : grouped.entrySet()) {
            List<Invoice> eqInvoices = entry.getValue();
            Equipment equipment = eqInvoices.get(0).getBooking().getEquipment();

            BigDecimal totalCost = eqInvoices.stream()
                    .map(Invoice::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            int bookingCount = eqInvoices.size();

            BigDecimal equipmentRate = equipment.getHourlyRate() != null
                    ? equipment.getHourlyRate()
                    : hourlyRateMap.get(equipment.getId());

            eqCosts.add(CostBreakdownResponse.EquipmentCost.builder()
                    .equipmentId(equipment.getId())
                    .equipmentName(equipment.getEquipmentName())
                    .equipmentCode(equipment.getEquipmentCode())
                    .totalCost(totalCost)
                    .hourlyRate(equipmentRate)
                    .bookingCount(bookingCount)
                    .build());
        }

        return eqCosts;
    }

    private List<Invoice> getInvoicesForDepartment(Long departmentId) {
        return invoiceRepository.findAll().stream()
                .filter(inv -> inv.getBooking() != null
                        && inv.getBooking().getEquipment() != null
                        && inv.getBooking().getEquipment().getLaboratory() != null
                        && inv.getBooking().getEquipment().getLaboratory().getDepartment() != null
                        && inv.getBooking().getEquipment().getLaboratory().getDepartment().getId().equals(departmentId))
                .toList();
    }
}
