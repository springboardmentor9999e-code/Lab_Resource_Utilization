package com.rems.controller;

import com.rems.dto.UserResponse;
import com.rems.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PatchMapping("/{id}/approve-institution-administrator")
    @PreAuthorize("hasAuthority('manage_all_institutions') or isAuthenticated()")
    public ResponseEntity<?> approveInstitutionAdministrator(@PathVariable Long id, Principal principal) {
        try {
            String adminEmail = (principal != null) ? principal.getName() : null;
            return ResponseEntity.ok(userService.approveInstitutionAdministrator(id, adminEmail));
        } catch (com.rems.exception.ApiException e) {
            return ResponseEntity.status(e.getStatus())
                    .body(java.util.Map.of("message", e.getMessage(), "error", e.getStatus().getReasonPhrase()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("message", e.getMessage() != null ? e.getMessage() : "Failed to approve institution administrator"));
        }
    }

    @PatchMapping("/{id}/approve-department-head")
    @PreAuthorize("hasAuthority('approve_department_head') or isAuthenticated()")
    public ResponseEntity<?> approveDepartmentHead(@PathVariable Long id, Principal principal) {
        try {
            String adminEmail = (principal != null) ? principal.getName() : null;
            return ResponseEntity.ok(userService.approveDepartmentHead(id, adminEmail));
        } catch (com.rems.exception.ApiException e) {
            return ResponseEntity.status(e.getStatus())
                    .body(java.util.Map.of("message", e.getMessage(), "error", e.getStatus().getReasonPhrase()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("message", e.getMessage() != null ? e.getMessage() : "Failed to approve department head"));
        }
    }

    @PatchMapping("/{id}/approve-lab-manager")
    @PreAuthorize("hasAuthority('approve_lab_manager') or isAuthenticated()")
    public ResponseEntity<?> approveLabManager(@PathVariable Long id, Principal principal) {
        try {
            String adminEmail = (principal != null) ? principal.getName() : null;
            return ResponseEntity.ok(userService.approveLabManager(id, adminEmail));
        } catch (com.rems.exception.ApiException e) {
            return ResponseEntity.status(e.getStatus())
                    .body(java.util.Map.of("message", e.getMessage(), "error", e.getStatus().getReasonPhrase()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("message", e.getMessage() != null ? e.getMessage() : "Failed to approve lab manager"));
        }
    }

    @PatchMapping("/{id}/approve-lab-technician")
    @PreAuthorize("hasAuthority('approve_lab_technician') or isAuthenticated()")
    public ResponseEntity<?> approveLabTechnician(@PathVariable Long id, Principal principal) {
        try {
            String adminEmail = (principal != null) ? principal.getName() : null;
            return ResponseEntity.ok(userService.approveLabTechnician(id, adminEmail));
        } catch (com.rems.exception.ApiException e) {
            return ResponseEntity.status(e.getStatus())
                    .body(java.util.Map.of("message", e.getMessage(), "error", e.getStatus().getReasonPhrase()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("message", e.getMessage() != null ? e.getMessage() : "Failed to approve lab technician"));
        }
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> rejectUser(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(userService.rejectUser(id, principal.getName()));
    }

    @GetMapping("/pending-approvals")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<UserResponse>> getPendingApprovals(Principal principal) {
        return ResponseEntity.ok(userService.getPendingApprovals(principal.getName()));
    }
}
