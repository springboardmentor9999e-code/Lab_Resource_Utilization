package com.rems.controller;

import com.rems.dto.DepartmentRequest;
import com.rems.dto.DepartmentResponse;
import com.rems.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @PostMapping
    @PreAuthorize("hasAuthority('manage_departments')")
    public ResponseEntity<DepartmentResponse> createDepartment(@Valid @RequestBody DepartmentRequest request, Principal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(departmentService.createDepartment(request, principal.getName()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('manage_departments')")
    public ResponseEntity<Map<String, String>> deleteDepartment(@PathVariable Long id, Principal principal) {
        departmentService.deleteDepartment(id, principal.getName());
        return ResponseEntity.ok(Map.of("message", "Department deleted successfully"));
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DepartmentResponse>> getMyInstitutionDepartments(Principal principal) {
        return ResponseEntity.ok(departmentService.getMyInstitutionDepartments(principal.getName()));
    }
}
