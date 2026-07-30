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
    public ResponseEntity<WaitlistResponse> joinWaitlist(
            @RequestParam Long equipmentId,
            @RequestParam String startTime,
            @RequestParam String endTime) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Instant start = Instant.parse(startTime);
        Instant end = Instant.parse(endTime);
        WaitlistEntry entry = waitlistService.joinWaitlist(equipmentId, start, end, email);
        
        List<WaitlistEntry> allWaiting = waitlistRepository.findByEquipmentEquipmentIdAndStatusOrderByCreatedAtAsc(equipmentId, "Waiting");
        return ResponseEntity.ok(toResponse(entry, allWaiting));
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
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/active-notifications")
    public ResponseEntity<List<WaitlistResponse>> getActiveNotifications() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<WaitlistEntry> entries = waitlistService.getActiveNotifications(email);
        List<WaitlistResponse> response = entries.stream()
                .map(entry -> toResponse(entry, null))
                .toList();
        return ResponseEntity.ok(response);
    }

    private WaitlistResponse toResponse(WaitlistEntry entry, List<WaitlistEntry> allWaiting) {
        Integer queuePos = null;
        if ("Waiting".equalsIgnoreCase(entry.getStatus()) && allWaiting != null) {
            List<WaitlistEntry> sortedWaiting = allWaiting.stream()
                    .filter(w -> w.getEquipment().getEquipmentId().equals(entry.getEquipment().getEquipmentId())
                            && "Waiting".equalsIgnoreCase(w.getStatus()))
                    .sorted(java.util.Comparator.comparing(WaitlistEntry::getCreatedAt))
                    .toList();
            int idx = sortedWaiting.indexOf(entry);
            if (idx != -1) {
                queuePos = idx + 1;
            }
        }

        return WaitlistResponse.builder()
                .waitlistId(entry.getWaitlistId())
                .equipmentId(entry.getEquipment().getEquipmentId())
                .equipmentName(entry.getEquipment().getName())
                .labName(entry.getEquipment().getLab() != null ? entry.getEquipment().getLab().getName() : "Unknown Lab")
                .userId(entry.getUser().getUserId())
                .userName(entry.getUser().getName())
                .userEmail(entry.getUser().getEmail())
                .requestedStart(entry.getRequestedStart())
                .requestedEnd(entry.getRequestedEnd())
                .status(entry.getStatus())
                .createdAt(entry.getCreatedAt())
                .notifiedAt(entry.getNotifiedAt())
                .queuePosition(queuePos)
                .build();
    }
}
