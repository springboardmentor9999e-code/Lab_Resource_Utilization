package com.lrplatform.controller;

import com.lrplatform.dto.request.AdminPasswordResetRequest;
import com.lrplatform.dto.request.RoleChangeRequest;
import com.lrplatform.dto.request.UserCreateRequest;
import com.lrplatform.dto.request.UserUpdateRequest;
import com.lrplatform.dto.response.ApiResponse;
import com.lrplatform.dto.response.UserListResponse;
import com.lrplatform.dto.response.UserResponse;
import com.lrplatform.exception.ForbiddenException;
import com.lrplatform.model.entity.User;
import com.lrplatform.security.CurrentUserUtil;
import com.lrplatform.service.UserManagementService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN')")
public class UserManagementController {

    private final UserManagementService userManagementService;
    private final CurrentUserUtil currentUserUtil;

    @GetMapping
    public ResponseEntity<UserListResponse> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Long institutionId,
            @RequestParam(required = false) Boolean status,
            HttpServletRequest request) {
        User currentUser = currentUserUtil.getCurrentUser(request);
        if (currentUser.getRole().name().equals("INSTITUTION_ADMIN")) {
            institutionId = currentUser.getInstitution() != null ? currentUser.getInstitution().getId() : null;
        }
        return ResponseEntity.ok(userManagementService.getAllUsers(page, size, search, role, institutionId, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id, HttpServletRequest request) {
        UserResponse user = userManagementService.getUserById(id);
        verifyInstitutionAccess(id, request);
        return ResponseEntity.ok(user);
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createUser(@Valid @RequestBody UserCreateRequest request, HttpServletRequest requestCtx) {
        User currentUser = currentUserUtil.getCurrentUser(requestCtx);
        if (currentUser.getRole().name().equals("INSTITUTION_ADMIN")) {
            Long myInstitutionId = currentUser.getInstitution() != null ? currentUser.getInstitution().getId() : null;
            if (myInstitutionId == null) {
                throw new ForbiddenException("No institution assigned to your account");
            }
            request.setInstitutionId(myInstitutionId);
        }
        userManagementService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, @Valid @RequestBody UserUpdateRequest request, HttpServletRequest requestCtx) {
        verifyInstitutionAccess(id, requestCtx);
        return ResponseEntity.ok(userManagementService.updateUser(id, request));
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<UserResponse> changeUserRole(@PathVariable Long id, @Valid @RequestBody RoleChangeRequest request, HttpServletRequest requestCtx) {
        verifyInstitutionAccess(id, requestCtx);
        return ResponseEntity.ok(userManagementService.changeUserRole(id, request));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<UserResponse> toggleUserStatus(@PathVariable Long id, HttpServletRequest requestCtx) {
        verifyInstitutionAccess(id, requestCtx);
        return ResponseEntity.ok(userManagementService.toggleUserStatus(id));
    }

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(@PathVariable Long id, @Valid @RequestBody AdminPasswordResetRequest request, HttpServletRequest requestCtx) {
        verifyInstitutionAccess(id, requestCtx);
        userManagementService.resetPassword(id, request);
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteUser(@PathVariable Long id, HttpServletRequest requestCtx) {
        verifyInstitutionAccess(id, requestCtx);
        userManagementService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully"));
    }

    private void verifyInstitutionAccess(Long userId, HttpServletRequest request) {
        User currentUser = currentUserUtil.getCurrentUser(request);
        if (currentUser.getRole().name().equals("SYSTEM_ADMIN")) {
            return;
        }
        UserResponse targetUser = userManagementService.getUserById(userId);
        Long myInstitutionId = currentUser.getInstitution() != null ? currentUser.getInstitution().getId() : null;
        if (myInstitutionId == null || !myInstitutionId.equals(targetUser.getInstitutionId())) {
            throw new ForbiddenException("You can only manage users within your institution");
        }
    }
}
