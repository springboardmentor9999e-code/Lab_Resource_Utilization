package com.lrplatform.service;

import com.lrplatform.annotation.Auditable;
import com.lrplatform.dto.request.BudgetRequest;
import com.lrplatform.dto.response.BudgetResponse;
import com.lrplatform.exception.ResourceNotFoundException;
import com.lrplatform.model.entity.Department;
import com.lrplatform.model.entity.DepartmentBudget;
import com.lrplatform.model.entity.Invoice;
import com.lrplatform.model.enums.PaymentStatus;
import com.lrplatform.repository.DepartmentBudgetRepository;
import com.lrplatform.repository.DepartmentRepository;
import com.lrplatform.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class BudgetService {

    private final DepartmentBudgetRepository budgetRepository;
    private final DepartmentRepository departmentRepository;
    private final InvoiceRepository invoiceRepository;

    @Auditable(module = "BUDGET", action = "CREATE", entityType = "DepartmentBudget")
    @Transactional
    public DepartmentBudget setBudget(BudgetRequest request) {
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));

        DepartmentBudget budget = budgetRepository.findByDepartmentIdAndFiscalYear(
                request.getDepartmentId(), request.getFiscalYear()).orElse(null);

        if (budget != null) {
            budget.setBudgetAmount(request.getBudgetAmount());
            budget.setDescription(request.getDescription());
            budget.setUpdatedAt(LocalDateTime.now());
            log.info("Updated budget for dept {} year {}: {}", department.getDepartmentName(), request.getFiscalYear(), request.getBudgetAmount());
        } else {
            budget = DepartmentBudget.builder()
                    .department(department)
                    .fiscalYear(request.getFiscalYear())
                    .budgetAmount(request.getBudgetAmount())
                    .description(request.getDescription())
                    .build();
            log.info("Created budget for dept {} year {}: {}", department.getDepartmentName(), request.getFiscalYear(), request.getBudgetAmount());
        }

        return budgetRepository.save(budget);
    }

    public DepartmentBudget getBudget(Long id) {
        return budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with id: " + id));
    }

    public List<BudgetResponse> getAllBudgets(Integer fiscalYear, Long institutionId) {
        List<DepartmentBudget> budgets;
        if (institutionId != null) {
            budgets = budgetRepository.findByInstitutionIdAndFiscalYear(institutionId, fiscalYear);
        } else if (fiscalYear != null) {
            budgets = budgetRepository.findByFiscalYear(fiscalYear);
        } else {
            budgets = budgetRepository.findAll();
        }
        return budgets.stream().map(this::toBudgetResponse).toList();
    }

    private BudgetResponse toBudgetResponse(DepartmentBudget b) {
        BigDecimal budgetAmount = b.getBudgetAmount();
        BigDecimal spent = getSpentAmount(b.getDepartment().getId());
        BigDecimal remaining = budgetAmount.subtract(spent);
        double utilPercent = budgetAmount.compareTo(BigDecimal.ZERO) > 0
                ? spent.multiply(BigDecimal.valueOf(100))
                .divide(budgetAmount, 2, RoundingMode.HALF_UP).doubleValue()
                : 0.0;
        int invoiceCount = getInvoiceCount(b.getDepartment().getId());

        return BudgetResponse.builder()
                .id(b.getId())
                .departmentId(b.getDepartment().getId())
                .departmentName(b.getDepartment().getDepartmentName())
                .fiscalYear(b.getFiscalYear())
                .budgetAmount(budgetAmount)
                .spentAmount(spent)
                .remaining(remaining)
                .utilizationPercent(utilPercent)
                .invoiceCount(invoiceCount)
                .description(b.getDescription())
                .build();
    }

    private BigDecimal getSpentAmount(Long departmentId) {
        int currentYear = LocalDate.now().getYear();
        return invoiceRepository.findAll().stream()
                .filter(inv -> inv.getBooking() != null
                        && inv.getBooking().getEquipment() != null
                        && inv.getBooking().getEquipment().getLaboratory() != null
                        && inv.getBooking().getEquipment().getLaboratory().getDepartment() != null
                        && inv.getBooking().getEquipment().getLaboratory().getDepartment().getId().equals(departmentId)
                        && inv.getGeneratedAt() != null
                        && inv.getGeneratedAt().getYear() == currentYear)
                .map(inv -> inv.getTotalAmount() != null ? inv.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private int getInvoiceCount(Long departmentId) {
        int currentYear = LocalDate.now().getYear();
        return (int) invoiceRepository.findAll().stream()
                .filter(inv -> inv.getBooking() != null
                        && inv.getBooking().getEquipment() != null
                        && inv.getBooking().getEquipment().getLaboratory() != null
                        && inv.getBooking().getEquipment().getLaboratory().getDepartment() != null
                        && inv.getBooking().getEquipment().getLaboratory().getDepartment().getId().equals(departmentId)
                        && inv.getGeneratedAt() != null
                        && inv.getGeneratedAt().getYear() == currentYear)
                .count();
    }

    public List<DepartmentBudget> getBudgetsByDepartment(Long departmentId) {
        return budgetRepository.findByDepartmentIdAndFiscalYear(departmentId, null) != null
                ? budgetRepository.findByFiscalYear(null).stream()
                    .filter(b -> b.getDepartment().getId().equals(departmentId))
                    .toList()
                : List.of();
    }

    @Auditable(module = "BUDGET", action = "UPDATE", entityType = "DepartmentBudget")
    @Transactional
    public DepartmentBudget updateBudget(Long id, BudgetRequest request) {
        DepartmentBudget budget = getBudget(id);
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));

        budget.setDepartment(department);
        budget.setFiscalYear(request.getFiscalYear());
        budget.setBudgetAmount(request.getBudgetAmount());
        budget.setDescription(request.getDescription());
        budget.setUpdatedAt(LocalDateTime.now());

        return budgetRepository.save(budget);
    }

    @Auditable(module = "BUDGET", action = "DELETE", entityType = "DepartmentBudget")
    @Transactional
    public void deleteBudget(Long id) {
        DepartmentBudget budget = getBudget(id);
        budgetRepository.delete(budget);
        log.info("Deleted budget id {} for dept {} year {}", id, budget.getDepartment().getDepartmentName(), budget.getFiscalYear());
    }
}
