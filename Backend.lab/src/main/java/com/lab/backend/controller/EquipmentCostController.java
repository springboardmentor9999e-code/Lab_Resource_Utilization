package com.lab.backend.controller;

import com.lab.backend.dto.*;
import com.lab.backend.service.EquipmentCostService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/equipment-costs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class EquipmentCostController {

    private final EquipmentCostService equipmentCostService;

    // ============ EQUIPMENT COST APIS ============

    @PostMapping
    public ResponseEntity<ApiResponse<EquipmentCostResponse>> createEquipmentCost(
            @RequestBody EquipmentCostRequest request) {
        try {
            EquipmentCostResponse response = equipmentCostService.createEquipmentCost(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(true, "Equipment cost created successfully", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, "Error creating equipment cost: " + e.getMessage(), null));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<EquipmentCostResponse>>> getAllEquipmentCosts() {
        try {
            List<EquipmentCostResponse> response = equipmentCostService.getAllEquipmentCosts();
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(true, "Equipment costs retrieved successfully", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Error retrieving equipment costs", null));
        }
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<EquipmentCostResponse>>> getActiveEquipmentCosts() {
        try {
            List<EquipmentCostResponse> response = equipmentCostService.getActiveEquipmentCosts();
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(true, "Active equipment costs retrieved", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Error retrieving active equipment costs", null));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EquipmentCostResponse>> getEquipmentCostById(@PathVariable Long id) {
        try {
            EquipmentCostResponse response = equipmentCostService.getEquipmentCostById(id);
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(true, "Equipment cost retrieved successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EquipmentCostResponse>> updateEquipmentCost(
            @PathVariable Long id,
            @RequestBody EquipmentCostRequest request) {
        try {
            EquipmentCostResponse response = equipmentCostService.updateEquipmentCost(id, request);
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(true, "Equipment cost updated successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEquipmentCost(@PathVariable Long id) {
        try {
            equipmentCostService.deleteEquipmentCost(id);
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(true, "Equipment cost deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/department/{departmentName}")
    public ResponseEntity<ApiResponse<List<EquipmentCostResponse>>> getEquipmentCostsByDepartment(
            @PathVariable String departmentName) {
        try {
            List<EquipmentCostResponse> response = equipmentCostService
                    .getEquipmentCostsByDepartment(departmentName);
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(true, "Equipment costs for department retrieved", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Error retrieving equipment costs", null));
        }
    }

    // ============ DEPARTMENT COST APIS ============

    @GetMapping("/department-costs/all")
    public ResponseEntity<ApiResponse<List<DepartmentCostResponse>>> getDepartmentCosts() {
        try {
            List<DepartmentCostResponse> response = equipmentCostService.getDepartmentCosts();
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(true, "Department costs retrieved successfully", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Error retrieving department costs", null));
        }
    }

    @GetMapping("/department-costs/{departmentName}")
    public ResponseEntity<ApiResponse<DepartmentCostResponse>> getDepartmentCostByName(
            @PathVariable String departmentName) {
        try {
            DepartmentCostResponse response = equipmentCostService.getDepartmentCostByName(departmentName);
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(true, "Department cost retrieved successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    // ============ MONTHLY COST APIS ============

    @GetMapping("/monthly-cost/total")
    public ResponseEntity<ApiResponse<TotalMonthlyCostResponse>> getTotalMonthlyCost() {
        try {
            TotalMonthlyCostResponse response = equipmentCostService.getTotalMonthlyCost();
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(true, "Total monthly cost retrieved", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Error retrieving total monthly cost", null));
        }
    }

    @GetMapping("/monthly-cost/department/{departmentName}")
    public ResponseEntity<ApiResponse<MonthlyCostResponse>> getMonthlyCostByDepartment(
            @PathVariable String departmentName) {
        try {
            MonthlyCostResponse response = equipmentCostService.getMonthlyCostByDepartment(departmentName);
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(true, "Department monthly cost retrieved", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Error retrieving monthly cost", null));
        }
    }

    @GetMapping("/monthly-cost/all")
    public ResponseEntity<ApiResponse<List<MonthlyCostResponse>>> getAllMonthlyCostsByDepartment() {
        try {
            List<MonthlyCostResponse> response = equipmentCostService.getAllMonthlyCostsByDepartment();
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(true, "All department monthly costs retrieved", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Error retrieving monthly costs", null));
        }
    }

    // ============ BILLING APIS ============

    @GetMapping("/billing/monthly")
    public ResponseEntity<ApiResponse<List<BillingMonthlyResponse>>> getBillingByMonth() {
        try {
            List<BillingMonthlyResponse> response = equipmentCostService.getBillingByMonth();
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(true, "Monthly billing data retrieved", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Error retrieving billing data", null));
        }
    }

    @GetMapping("/billing/yearly")
    public ResponseEntity<ApiResponse<List<BillingYearlyResponse>>> getBillingByYear() {
        try {
            List<BillingYearlyResponse> response = equipmentCostService.getBillingByYear();
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(true, "Yearly billing data retrieved", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Error retrieving billing data", null));
        }
    }

    @GetMapping("/billing/range")
    public ResponseEntity<ApiResponse<List<BillingDepartmentResponse>>> getBillingByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            List<BillingDepartmentResponse> response = equipmentCostService
                    .getBillingByDateRange(startDate, endDate);
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(true, "Billing data for date range retrieved", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, "Error retrieving billing data: " + e.getMessage(), null));
        }
    }

    @GetMapping("/billing/report")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateBillingReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            Map<String, Object> report = equipmentCostService.generateBillingReport(startDate, endDate);
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(true, "Billing report generated successfully", report));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, "Error generating report: " + e.getMessage(), null));
        }
    }

    @GetMapping("/billing/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBillingAnalytics() {
        try {
            Map<String, Object> analytics = equipmentCostService.getBillingAnalytics();
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(true, "Billing analytics retrieved", analytics));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Error retrieving analytics", null));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Equipment Cost Service is running");
    }
}
