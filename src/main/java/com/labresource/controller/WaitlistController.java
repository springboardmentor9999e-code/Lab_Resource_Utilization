package com.labresource.controller;

import com.labresource.dto.WaitlistJoinRequest;
import com.labresource.entity.Equipment;
import com.labresource.entity.WaitlistEntry;
import com.labresource.entity.WaitlistStatus;
import com.labresource.repository.EquipmentRepository;
import com.labresource.repository.WaitlistRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/waitlist")
public class WaitlistController {

    private final WaitlistRepository waitlistRepository;
    private final EquipmentRepository equipmentRepository;

    public WaitlistController(WaitlistRepository waitlistRepository, EquipmentRepository equipmentRepository) {
        this.waitlistRepository = waitlistRepository;
        this.equipmentRepository = equipmentRepository;
    }

    // Any logged-in user can join the waitlist for a piece of equipment
    @PostMapping
    public ResponseEntity<WaitlistEntry> joinWaitlist(
            @RequestBody WaitlistJoinRequest request,
            Authentication authentication) {

        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        boolean alreadyWaiting = waitlistRepository.existsByEquipmentIdAndUserEmailAndStatus(
                request.getEquipmentId(), authentication.getName(), WaitlistStatus.WAITING);

        if (alreadyWaiting) {
            throw new RuntimeException("You are already on the waitlist for this equipment");
        }

        WaitlistEntry entry = WaitlistEntry.builder()
                .equipmentId(equipment.getId())
                .equipmentName(equipment.getName())
                .userEmail(authentication.getName())
                .status(WaitlistStatus.WAITING)
                .build();

        return ResponseEntity.ok(waitlistRepository.save(entry));
    }

    // Anyone logged in can view the full waitlist (transparency, same pattern as other modules)
    @GetMapping
    public ResponseEntity<List<WaitlistEntry>> getAllWaitlist() {
        return ResponseEntity.ok(waitlistRepository.findAll());
    }

    // Any logged-in user can view their own waitlist entries
    @GetMapping("/mine")
    public ResponseEntity<List<WaitlistEntry>> getMyWaitlist(Authentication authentication) {
        return ResponseEntity.ok(waitlistRepository.findByUserEmail(authentication.getName()));
    }

    // A user can remove themselves from the waitlist — but only their OWN entry
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> leaveWaitlist(@PathVariable Long id, Authentication authentication) {
        WaitlistEntry entry = waitlistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Waitlist entry not found"));

        if (!entry.getUserEmail().equals(authentication.getName())) {
            throw new RuntimeException("You can only remove your own waitlist entry");
        }

        waitlistRepository.delete(entry);
        return ResponseEntity.noContent().build();
    }

    // Only LAB_MANAGER can mark a waitlist entry as fulfilled (e.g. after manually booking it for them)
    @PutMapping("/{id}/fulfill")
    @PreAuthorize("hasRole('LAB_MANAGER')")
    public ResponseEntity<WaitlistEntry> fulfillWaitlistEntry(@PathVariable Long id) {
        WaitlistEntry entry = waitlistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Waitlist entry not found"));

        entry.setStatus(WaitlistStatus.FULFILLED);
        return ResponseEntity.ok(waitlistRepository.save(entry));
    }
}