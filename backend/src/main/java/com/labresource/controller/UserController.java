package com.labresource.controller;

import com.labresource.dto.request.ChangePasswordRequest;
import com.labresource.dto.request.UpdateProfileRequest;
import com.labresource.dto.request.UpdateRolesRequest;
import com.labresource.dto.response.ApiResponse;
import com.labresource.dto.response.UserResponse;
import com.labresource.service.interfaces.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/**
 * User endpoints — self-service profile management and admin user/role management.
 *
 *   Profile (any authenticated user): GET /me, PUT /me, POST /me/change-password
 *   Admin (SYSTEM_ADMIN, INSTITUTION_ADMIN): list users, change roles, activate/deactivate
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ---------------- Self-service ----------------

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Principal principal) {
        return ResponseEntity.ok(userService.getCurrentUser(principal.getName()));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request, Principal principal) {
        return ResponseEntity.ok(userService.updateProfile(principal.getName(), request));
    }

    @PostMapping("/me/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request, Principal principal) {
        userService.changePassword(principal.getName(), request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Password changed successfully", null));
    }

    // ---------------- Admin ----------------

    @GetMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role) {
        return ResponseEntity.ok(userService.getAllUsers(search, role));
    }

    @PutMapping("/{userId}/roles")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN')")
    public ResponseEntity<UserResponse> updateUserRoles(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateRolesRequest request) {
        return ResponseEntity.ok(userService.updateUserRoles(userId, request.getRoles()));
    }

    @PatchMapping("/{userId}/active")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN')")
    public ResponseEntity<UserResponse> setUserActive(
            @PathVariable Long userId,
            @RequestParam boolean active,
            Principal principal) {
        return ResponseEntity.ok(userService.setUserActive(userId, active, principal.getName()));
    }
}
