package com.labhub.controller;

import com.labhub.dto.common.ApiResponse;
import com.labhub.dto.rolerequest.RoleRequestCreate;
import com.labhub.dto.rolerequest.RoleRequestResponse;
import com.labhub.service.RoleRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Controller for the role upgrade request workflow.
 */
@RestController
@RequestMapping("/api/role-requests")
@RequiredArgsConstructor
public class RoleRequestController {

    private final RoleRequestService roleRequestService;

    /**
     * POST /api/role-requests — any authenticated user submits a role request
     */
    @PostMapping
    public ResponseEntity<ApiResponse<RoleRequestResponse>> submitRequest(
            @Valid @RequestBody RoleRequestCreate request,
            Authentication authentication) {
        RoleRequestResponse response = roleRequestService.submit(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Role request submitted successfully", response));
    }

    /**
     * GET /api/role-requests — SYSTEM_ADMIN only: view all requests
     */
    @GetMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<List<RoleRequestResponse>>> getAllRequests() {
        return ResponseEntity.ok(ApiResponse.success(roleRequestService.getAll()));
    }

    /**
     * GET /api/role-requests/my — current user's own requests
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<RoleRequestResponse>>> getMyRequests(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(roleRequestService.getMyRequests(authentication.getName())));
    }

    /**
     * PATCH /api/role-requests/{id}/approve — SYSTEM_ADMIN only
     */
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<RoleRequestResponse>> approveRequest(
            @PathVariable UUID id,
            Authentication authentication) {
        RoleRequestResponse response = roleRequestService.approve(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Role request approved", response));
    }

    /**
     * PATCH /api/role-requests/{id}/reject — SYSTEM_ADMIN only
     */
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<RoleRequestResponse>> rejectRequest(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body,
            Authentication authentication) {
        String reason = body != null ? body.getOrDefault("reason", null) : null;
        RoleRequestResponse response = roleRequestService.reject(id, authentication.getName(), reason);
        return ResponseEntity.ok(ApiResponse.success("Role request rejected", response));
    }
}
