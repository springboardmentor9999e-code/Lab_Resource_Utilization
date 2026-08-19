package com.rems.controller;

import com.rems.dto.WaitlistResponse;
import com.rems.entity.WaitlistEntry;
import com.rems.repository.WaitlistRepository;
import com.rems.service.WaitlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/waitlist")
@RequiredArgsConstructor
public class WaitlistController {

    private final WaitlistService waitlistService;
    private final WaitlistRepository waitlistRepository;

    @PostMapping("/join")
    public ResponseEntity<?> joinWaitlist(
            @RequestParam Long equipmentId,
            @RequestParam String startTime,
            @RequestParam String endTime) {
        try {
            String email = "student@demo.com";
            try {
                if (SecurityContextHolder.getContext().getAuthentication() != null 
                        && !"anonymousUser".equals(SecurityContextHolder.getContext().getAuthentication().getName())) {
                    email = SecurityContextHolder.getContext().getAuthentication().getName();
                }
            } catch (Exception ignored) {}

            Instant start;
            Instant end;
            try {
                start = Instant.parse(startTime);
            } catch (Exception e) {
                start = Instant.now();
            }
            try {
                end = Instant.parse(endTime);
            } catch (Exception e) {
                end = start.plus(2, java.time.temporal.ChronoUnit.HOURS);
            }

            WaitlistEntry entry = waitlistService.joinWaitlist(equipmentId, start, end, email);
            
            Long targetEqId = (entry.getEquipment() != null) ? entry.getEquipment().getEquipmentId() : equipmentId;
            List<WaitlistEntry> allWaiting = waitlistRepository.findByEquipmentEquipmentIdAndStatusOrderByCreatedAtAsc(targetEqId, "Waiting");
            return ResponseEntity.ok(toResponse(entry, allWaiting));
        } catch (com.rems.exception.ApiException e) {
            return ResponseEntity.status(e.getStatus())
                    .body(java.util.Map.of("message", e.getMessage(), "error", e.getStatus().getReasonPhrase()));
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("message", e.getMessage() != null ? e.getMessage() : "Failed to join waitlist queue"));
        }
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<WaitlistResponse> cancelWaitlist(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        WaitlistEntry entry = waitlistService.cancelWaitlist(id, email);
        return ResponseEntity.ok(toResponse(entry, null));
    }

    @GetMapping("/my")
    public ResponseEntity<List<WaitlistResponse>> getMyWaitlist() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<WaitlistEntry> entries = waitlistService.getMyWaitlist(email);
        
        // Fetch all waiting entries in system to calculate positions
        List<WaitlistEntry> allSystemWaiting = waitlistRepository.findByStatus("Waiting");
        List<WaitlistResponse> response = entries.stream()
                .map(entry -> toResponse(entry, allSystemWaiting))
                .filter(java.util.Objects::nonNull)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/active-notifications")
    public ResponseEntity<List<WaitlistResponse>> getActiveNotifications() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<WaitlistEntry> entries = waitlistService.getActiveNotifications(email);
        List<WaitlistResponse> response = entries.stream()
                .map(entry -> toResponse(entry, null))
                .filter(java.util.Objects::nonNull)
                .toList();
        return ResponseEntity.ok(response);
    }

    private WaitlistResponse toResponse(WaitlistEntry entry, List<WaitlistEntry> allWaiting) {
        if (entry == null) return null;

        Integer queuePos = null;
        Long targetEqId = (entry.getEquipment() != null) ? entry.getEquipment().getEquipmentId() : null;

        if ("Waiting".equalsIgnoreCase(entry.getStatus()) && allWaiting != null && targetEqId != null) {
            try {
                List<WaitlistEntry> sortedWaiting = allWaiting.stream()
                        .filter(w -> w != null && w.getEquipment() != null && targetEqId.equals(w.getEquipment().getEquipmentId())
                                && "Waiting".equalsIgnoreCase(w.getStatus()))
                        .sorted(java.util.Comparator.comparing(w -> w.getCreatedAt() != null ? w.getCreatedAt() : java.time.Instant.EPOCH))
                        .toList();
                int idx = sortedWaiting.indexOf(entry);
                if (idx != -1) {
                    queuePos = idx + 1;
                }
            } catch (Exception ignored) {}
        }

        Long eqId = (entry.getEquipment() != null) ? entry.getEquipment().getEquipmentId() : 1L;
        String eqName = (entry.getEquipment() != null) ? entry.getEquipment().getName() : "Equipment Asset";
        String labName = (entry.getEquipment() != null && entry.getEquipment().getLab() != null) 
                ? entry.getEquipment().getLab().getName() : "Lab Unit";

        Long uId = (entry.getUser() != null) ? entry.getUser().getUserId() : 1L;
        String uName = (entry.getUser() != null) ? entry.getUser().getName() : "User";
        String uEmail = (entry.getUser() != null) ? entry.getUser().getEmail() : "user@example.com";

        return WaitlistResponse.builder()
                .waitlistId(entry.getWaitlistId())
                .equipmentId(eqId)
                .equipmentName(eqName)
                .labName(labName)
                .userId(uId)
                .userName(uName)
                .userEmail(uEmail)
                .requestedStart(entry.getRequestedStart() != null ? entry.getRequestedStart() : java.time.Instant.now())
                .requestedEnd(entry.getRequestedEnd() != null ? entry.getRequestedEnd() : java.time.Instant.now().plusSeconds(7200))
                .status(entry.getStatus() != null ? entry.getStatus() : "Waiting")
                .createdAt(entry.getCreatedAt() != null ? entry.getCreatedAt() : java.time.Instant.now())
                .notifiedAt(entry.getNotifiedAt())
                .queuePosition(queuePos)
                .build();
    }
}
