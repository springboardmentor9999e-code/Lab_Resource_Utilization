package com.lrplatform.controller;

import com.lrplatform.dto.request.RoleConfigUpdateRequest;
import com.lrplatform.dto.response.ApiResponse;
import com.lrplatform.dto.response.RoleResponse;
import com.lrplatform.model.enums.UserRole;
import com.lrplatform.service.RoleManagementService;
import com.lrplatform.service.UserManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/roles")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SYSTEM_ADMIN')")
public class RoleManagementController {

    private final UserManagementService userManagementService;
    private final RoleManagementService roleManagementService;

    @GetMapping
    public ResponseEntity<List<RoleResponse>> getAllRoles() {
        return ResponseEntity.ok(roleManagementService.getAllRoles());
    }

    @GetMapping("/{role}/users")
    public ResponseEntity<?> getUsersByRole(@PathVariable String role) {
        try {
            UserRole.valueOf(role);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid role: " + role));
        }
        var result = userManagementService.getAllUsers(0, 100, null, role, null, null);
        return ResponseEntity.ok(result.getUsers());
    }

    @PutMapping("/{role}")
    public ResponseEntity<?> updateRoleConfig(@PathVariable String role, @RequestBody RoleConfigUpdateRequest request) {
        try {
            UserRole.valueOf(role);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid role: " + role));
        }
        RoleResponse updated = roleManagementService.updateRoleConfig(role, request);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{role}")
    public ResponseEntity<?> getRoleConfig(@PathVariable String role) {
        try {
            UserRole.valueOf(role);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid role: " + role));
        }
        RoleResponse config = roleManagementService.getRoleConfig(role);
        return ResponseEntity.ok(config);
    }
}
