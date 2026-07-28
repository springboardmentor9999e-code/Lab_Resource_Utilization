package com.lrplatform.controller;

import com.lrplatform.dto.request.BudgetRequest;
import com.lrplatform.dto.response.ApiResponse;
import com.lrplatform.dto.response.BudgetResponse;
import com.lrplatform.model.entity.DepartmentBudget;
import com.lrplatform.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @PostMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN')")
    public ResponseEntity<DepartmentBudget> setBudget(@Valid @RequestBody BudgetRequest request) {
        DepartmentBudget budget = budgetService.setBudget(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(budget);
    }

    @GetMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN') or hasRole('DEPARTMENT_HEAD') or hasRole('LAB_MANAGER')")
    public ResponseEntity<List<BudgetResponse>> getAllBudgets(
            @RequestParam(required = false) Integer fiscalYear,
            @RequestParam(required = false) Long institutionId) {
        return ResponseEntity.ok(budgetService.getAllBudgets(fiscalYear, institutionId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN') or hasRole('DEPARTMENT_HEAD')")
    public ResponseEntity<DepartmentBudget> getBudget(@PathVariable Long id) {
        return ResponseEntity.ok(budgetService.getBudget(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN')")
    public ResponseEntity<DepartmentBudget> updateBudget(@PathVariable Long id,
                                                          @Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.ok(budgetService.updateBudget(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN')")
    public ResponseEntity<ApiResponse> deleteBudget(@PathVariable Long id) {
        budgetService.deleteBudget(id);
        return ResponseEntity.ok(ApiResponse.success("Budget deleted successfully"));
    }
}
