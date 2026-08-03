package com.labresource.controller;

import com.labresource.dto.RoleRequestCreateDto;
import com.labresource.entity.*;
import com.labresource.repository.RoleRequestRepository;
import com.labresource.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/role-requests")
public class RoleRequestController {

    private final RoleRequestRepository roleRequestRepository;
    private final UserRepository userRepository;

    public RoleRequestController(RoleRequestRepository roleRequestRepository, UserRepository userRepository) {
        this.roleRequestRepository = roleRequestRepository;
        this.userRepository = userRepository;
    }

    // Any logged-in user can request a role change
    @PostMapping
    public ResponseEntity<RoleRequest> createRequest(
            @RequestBody RoleRequestCreateDto dto,
            Authentication authentication) {

        RoleRequest request = RoleRequest.builder()
                .userEmail(authentication.getName())
                .requestedRole(dto.getRequestedRole())
                .reason(dto.getReason())
                .status(RoleRequestStatus.PENDING)
                .build();

        return ResponseEntity.ok(roleRequestRepository.save(request));
    }

    // Only SYSTEM_ADMINISTRATOR can view all role requests
    @GetMapping
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<List<RoleRequest>> getAllRequests() {
        return ResponseEntity.ok(roleRequestRepository.findAll());
    }

    // Only SYSTEM_ADMINISTRATOR can approve — this actually changes the user's role
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<RoleRequest> approveRequest(@PathVariable Long id) {

        RoleRequest request = roleRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        User user = userRepository.findByEmail(request.getUserEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setRole(request.getRequestedRole());
        userRepository.save(user);

        request.setStatus(RoleRequestStatus.APPROVED);
        return ResponseEntity.ok(roleRequestRepository.save(request));
    }

    // Only SYSTEM_ADMINISTRATOR can reject
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<RoleRequest> rejectRequest(@PathVariable Long id) {

        RoleRequest request = roleRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setStatus(RoleRequestStatus.REJECTED);
        return ResponseEntity.ok(roleRequestRepository.save(request));
    }
}
