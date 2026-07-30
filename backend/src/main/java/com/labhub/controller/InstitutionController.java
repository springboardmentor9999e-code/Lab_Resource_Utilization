package com.labhub.controller;

import com.labhub.dto.common.ApiResponse;
import com.labhub.dto.institution.DepartmentDTO;
import com.labhub.dto.institution.InstitutionDTO;
import com.labhub.enums.InstitutionStatus;
import com.labhub.service.InstitutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Controller for institutions and departments.
 */
@RestController
@RequestMapping("/api/institutions")
@RequiredArgsConstructor
public class InstitutionController {

    private final InstitutionService institutionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<InstitutionDTO>>> getAllInstitutions() {
        return ResponseEntity.ok(ApiResponse.success(institutionService.getAllInstitutions()));
    }

    @GetMapping("/approved")
    public ResponseEntity<ApiResponse<List<InstitutionDTO>>> getApprovedInstitutions() {
        return ResponseEntity.ok(ApiResponse.success(institutionService.getApprovedInstitutions()));
    }

    @GetMapping("/{id}/departments")
    public ResponseEntity<ApiResponse<List<DepartmentDTO>>> getDepartments(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(institutionService.getDepartmentsByInstitution(id)));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<InstitutionDTO>> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        InstitutionStatus status = InstitutionStatus.valueOf(body.get("status").toUpperCase());
        InstitutionDTO dto = institutionService.updateInstitutionStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Institution status updated successfully", dto));
    }

    @PostMapping("/{id}/departments")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'INSTITUTION_ADMIN')")
    public ResponseEntity<ApiResponse<DepartmentDTO>> createDepartment(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        DepartmentDTO dto = institutionService.createDepartment(id, body.get("name"), body.get("description"));
        return ResponseEntity.ok(ApiResponse.success("Department created successfully", dto));
    }
}

