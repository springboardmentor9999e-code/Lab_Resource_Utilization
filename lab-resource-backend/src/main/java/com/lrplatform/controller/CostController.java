package com.lrplatform.controller;

import com.lrplatform.dto.request.CostAllocationRequest;
import com.lrplatform.dto.response.BudgetSummaryResponse;
import com.lrplatform.dto.response.CostBreakdownResponse;
import com.lrplatform.dto.response.EquipmentLifecycleResponse;
import com.lrplatform.dto.response.UtilizationIntelligenceResponse;
import com.lrplatform.exception.ForbiddenException;
import com.lrplatform.model.entity.User;
import com.lrplatform.security.CurrentUserUtil;
import com.lrplatform.service.CostTrackingService;
import com.lrplatform.service.EquipmentLifecycleService;
import com.lrplatform.service.UtilizationIntelligenceService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/costs")
@RequiredArgsConstructor
public class CostController {

    private final CostTrackingService costTrackingService;
    private final UtilizationIntelligenceService utilizationIntelligenceService;
    private final EquipmentLifecycleService equipmentLifecycleService;
    private final CurrentUserUtil currentUserUtil;

    private Long getInstitutionIdIfInstitutionAdmin(HttpServletRequest request) {
        User currentUser = currentUserUtil.getCurrentUser(request);
        if (currentUser.getRole().name().equals("INSTITUTION_ADMIN")) {
            Long myInstitutionId = currentUser.getInstitution() != null ? currentUser.getInstitution().getId() : null;
            if (myInstitutionId == null) {
                throw new ForbiddenException("No institution assigned to your account");
            }
            return myInstitutionId;
        }
        return null;
    }

    private Long getDepartmentIdIfDepartmentHead(HttpServletRequest request) {
        User currentUser = currentUserUtil.getCurrentUser(request);
        if (currentUser.getRole().name().equals("DEPARTMENT_HEAD")) {
            Long departmentId = currentUser.getDepartment() != null ? currentUser.getDepartment().getId() : null;
            if (departmentId == null) {
                throw new ForbiddenException("No department assigned to your account");
            }
            return departmentId;
        }
        return null;
    }

    @PostMapping("/breakdown")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN') or hasRole('DEPARTMENT_HEAD')")
    public ResponseEntity<CostBreakdownResponse> getCostBreakdown(@RequestBody CostAllocationRequest request, HttpServletRequest httpRequest) {
        Long institutionId = getInstitutionIdIfInstitutionAdmin(httpRequest);
        Long departmentId = getDepartmentIdIfDepartmentHead(httpRequest);
        if (institutionId != null) {
            request.setInstitutionId(institutionId);
        } else if (departmentId != null) {
            request.setDepartmentId(departmentId);
        }
        return ResponseEntity.ok(costTrackingService.getCostBreakdown(request));
    }

    @GetMapping("/breakdown/department/{departmentId}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN') or hasRole('DEPARTMENT_HEAD')")
    public ResponseEntity<CostBreakdownResponse> getCostBreakdownByDepartment(@PathVariable Long departmentId, HttpServletRequest httpRequest) {
        Long myDeptId = getDepartmentIdIfDepartmentHead(httpRequest);
        if (myDeptId != null && !myDeptId.equals(departmentId)) {
            throw new ForbiddenException("You can only view cost data within your department");
        }
        return ResponseEntity.ok(costTrackingService.getCostBreakdownByDepartment(departmentId));
    }

    @GetMapping("/breakdown/institution/{institutionId}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN') or hasRole('DEPARTMENT_HEAD')")
    public ResponseEntity<CostBreakdownResponse> getCostBreakdownByInstitution(@PathVariable Long institutionId, HttpServletRequest httpRequest) {
        Long myInstitutionId = getInstitutionIdIfInstitutionAdmin(httpRequest);
        if (myInstitutionId != null && !myInstitutionId.equals(institutionId)) {
            throw new ForbiddenException("You can only view cost data within your institution");
        }
        return ResponseEntity.ok(costTrackingService.getCostBreakdownByInstitution(institutionId));
    }

    @GetMapping("/budget-summary")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN') or hasRole('DEPARTMENT_HEAD')")
    public ResponseEntity<BudgetSummaryResponse> getBudgetSummary(HttpServletRequest httpRequest) {
        Long institutionId = getInstitutionIdIfInstitutionAdmin(httpRequest);
        Long departmentId = getDepartmentIdIfDepartmentHead(httpRequest);
        if (institutionId != null) {
            return ResponseEntity.ok(costTrackingService.getBudgetSummaryByInstitution(institutionId));
        }
        if (departmentId != null) {
            return ResponseEntity.ok(costTrackingService.getBudgetSummaryByDepartment(departmentId));
        }
        return ResponseEntity.ok(costTrackingService.getBudgetSummary());
    }

    @GetMapping("/monthly-revenue/{year}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN') or hasRole('DEPARTMENT_HEAD')")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyRevenue(@PathVariable int year, HttpServletRequest httpRequest) {
        Long institutionId = getInstitutionIdIfInstitutionAdmin(httpRequest);
        Long departmentId = getDepartmentIdIfDepartmentHead(httpRequest);
        if (institutionId != null) {
            return ResponseEntity.ok(costTrackingService.getMonthlyRevenueByInstitution(year, institutionId));
        }
        if (departmentId != null) {
            return ResponseEntity.ok(costTrackingService.getMonthlyRevenueByDepartment(year, departmentId));
        }
        return ResponseEntity.ok(costTrackingService.getMonthlyRevenue(year));
    }

    @GetMapping("/utilization")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN') or hasRole('DEPARTMENT_HEAD')")
    public ResponseEntity<UtilizationIntelligenceResponse> getUtilizationIntelligence(
            HttpServletRequest httpRequest,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        LocalDate start = startDate != null ? startDate : LocalDate.now().withDayOfMonth(1);
        LocalDate end = endDate != null ? endDate : LocalDate.now();

        Long institutionId = getInstitutionIdIfInstitutionAdmin(httpRequest);
        Long departmentId = getDepartmentIdIfDepartmentHead(httpRequest);
        if (institutionId != null) {
            return ResponseEntity.ok(utilizationIntelligenceService.getUtilizationIntelligenceByInstitution(institutionId, start, end));
        }
        if (departmentId != null) {
            return ResponseEntity.ok(utilizationIntelligenceService.getUtilizationIntelligenceByDepartment(departmentId, start, end));
        }
        return ResponseEntity.ok(utilizationIntelligenceService.getUtilizationIntelligence(start, end));
    }

    @GetMapping("/lifecycle")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN') or hasRole('DEPARTMENT_HEAD')")
    public ResponseEntity<EquipmentLifecycleResponse> getEquipmentLifecycle(HttpServletRequest httpRequest) {
        Long institutionId = getInstitutionIdIfInstitutionAdmin(httpRequest);
        Long departmentId = getDepartmentIdIfDepartmentHead(httpRequest);
        if (institutionId != null) {
            return ResponseEntity.ok(equipmentLifecycleService.getEquipmentLifecycleByInstitution(institutionId));
        }
        if (departmentId != null) {
            return ResponseEntity.ok(equipmentLifecycleService.getEquipmentLifecycleByDepartment(departmentId));
        }
        return ResponseEntity.ok(equipmentLifecycleService.getEquipmentLifecycle());
    }
}
