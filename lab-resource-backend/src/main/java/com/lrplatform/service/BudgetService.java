package com.lrplatform.service;

import com.lrplatform.annotation.Auditable;
import com.lrplatform.dto.request.BudgetRequest;
import com.lrplatform.exception.ResourceNotFoundException;
import com.lrplatform.model.entity.Department;
import com.lrplatform.model.entity.DepartmentBudget;
import com.lrplatform.repository.DepartmentBudgetRepository;
import com.lrplatform.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class BudgetService {

    private final DepartmentBudgetRepository budgetRepository;
    private final DepartmentRepository departmentRepository;

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

    public List<DepartmentBudget> getAllBudgets(Integer fiscalYear, Long institutionId) {
        if (institutionId != null) {
            return budgetRepository.findByInstitutionIdAndFiscalYear(institutionId, fiscalYear);
        }
        if (fiscalYear != null) {
            return budgetRepository.findByFiscalYear(fiscalYear);
        }
        return budgetRepository.findAll();
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
