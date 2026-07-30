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
    @PreAuthorize("hasAuthority('manage_all_institutions')")
    public ResponseEntity<UserResponse> approveInstitutionAdministrator(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(userService.approveInstitutionAdministrator(id, principal.getName()));
    }

    @PatchMapping("/{id}/approve-department-head")
    @PreAuthorize("hasAuthority('approve_department_head')")
    public ResponseEntity<UserResponse> approveDepartmentHead(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(userService.approveDepartmentHead(id, principal.getName()));
    }

    @PatchMapping("/{id}/approve-lab-manager")
    @PreAuthorize("hasAuthority('approve_lab_manager')")
    public ResponseEntity<UserResponse> approveLabManager(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(userService.approveLabManager(id, principal.getName()));
    }

    @PatchMapping("/{id}/approve-lab-technician")
    @PreAuthorize("hasAuthority('approve_lab_technician')")
    public ResponseEntity<UserResponse> approveLabTechnician(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(userService.approveLabTechnician(id, principal.getName()));
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
