package com.labresource.controller;

import com.labresource.dto.response.ApiResponse;
import com.labresource.dto.response.WaitlistResponse;
import com.labresource.service.interfaces.WaitlistService;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/waitlist")
@RequiredArgsConstructor
public class WaitlistController {

    private static final Set<String> MANAGER_AUTHORITIES = Set.of(
            "ROLE_SYSTEM_ADMIN", "ROLE_DEPARTMENT_HEAD", "ROLE_LAB_MANAGER", "ROLE_LAB_TECHNICIAN");

    private final WaitlistService waitlistService;

    @Data
    public static class WaitlistRequest {
        @NotNull(message = "Equipment ID is required")
        private Long equipmentId;

        @NotNull(message = "Requested date is required")
        private LocalDate requestedDate;

        private LocalTime startTime;
        private LocalTime endTime;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WaitlistResponse>> joinWaitlist(
            @jakarta.validation.Valid @RequestBody WaitlistRequest request,
            Principal principal
    ) {
        WaitlistResponse response = waitlistService.joinWaitlist(
                request.getEquipmentId(),
                request.getRequestedDate(),
                request.getStartTime(),
                request.getEndTime(),
                principal.getName()
        );
        return new ResponseEntity<>(
                ApiResponse.<WaitlistResponse>builder()
                        .success(true)
                        .message("Added to waitlist at position " + response.getPosition())
                        .data(response)
                        .build(),
                HttpStatus.CREATED);
    }

    @GetMapping("/my")
    public ResponseEntity<List<WaitlistResponse>> getMyWaitlist(Principal principal) {
        return ResponseEntity.ok(waitlistService.getMyWaitlist(principal.getName()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'DEPARTMENT_HEAD', 'LAB_MANAGER', 'LAB_TECHNICIAN')")
    public ResponseEntity<List<WaitlistResponse>> getAllActiveEntries() {
        return ResponseEntity.ok(waitlistService.getAllActiveEntries());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<WaitlistResponse>> cancelWaitlistEntry(
            @PathVariable Long id,
            Principal principal,
            Authentication authentication
    ) {
        boolean isManager = authentication.getAuthorities().stream()
                .anyMatch(a -> MANAGER_AUTHORITIES.contains(a.getAuthority()));

        WaitlistResponse response = waitlistService.cancelWaitlistEntry(id, principal.getName(), isManager);
        return ResponseEntity.ok(ApiResponse.<WaitlistResponse>builder()
                .success(true)
                .message("Waitlist entry cancelled")
                .data(response)
                .build());
    }
}
