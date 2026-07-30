package com.labhub.controller;

import com.labhub.dto.common.ApiResponse;
import com.labhub.dto.user.UserDTO;
import com.labhub.enums.UserStatus;
import com.labhub.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * User management controller — admin only.
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'LAB_MANAGER', 'LAB_TECHNICIAN')")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers(org.springframework.security.core.Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUsersForCurrentUser(auth.getName())));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'INSTITUTION_ADMIN')")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'INSTITUTION_ADMIN')")
    public ResponseEntity<ApiResponse<UserDTO>> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        UserStatus status = UserStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(ApiResponse.success("User status updated", userService.updateStatus(id, status)));
    }
}
