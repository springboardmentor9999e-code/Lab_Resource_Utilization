package com.rems.service;

import com.rems.entity.Equipment;
import com.rems.entity.WaitlistEntry;
import com.rems.entity.User;
import com.rems.enums.EquipmentStatus;
import com.rems.exception.ApiException;
import com.rems.repository.EquipmentRepository;
import com.rems.repository.WaitlistRepository;
import com.rems.repository.UserRepository;
import com.rems.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WaitlistService {

    private final WaitlistRepository waitlistRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final InAppNotificationService inAppNotificationService;

    @Transactional
    public WaitlistEntry joinWaitlist(Long equipmentId, Instant requestedStart, Instant requestedEnd, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found with email: " + email, HttpStatus.NOT_FOUND));
        Equipment eq = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new ApiException("Equipment not found with id: " + equipmentId, HttpStatus.NOT_FOUND));

        // Check if equipment is available for direct booking
        if (eq.getStatus() == EquipmentStatus.AVAILABLE && eq.getAmount() != null && eq.getAmount() > 0) {
            throw new ApiException("Equipment is currently available. Please book it directly instead.", HttpStatus.BAD_REQUEST);
        }

        // Check if already in queue
        List<WaitlistEntry> active = waitlistRepository.findByEquipmentEquipmentIdAndStatusIn(equipmentId, List.of("Waiting", "Notified"));
        boolean alreadyQueued = active.stream().anyMatch(e -> e.getUser().getUserId().equals(user.getUserId()));
        if (alreadyQueued) {
            throw new ApiException("You are already in the waitlist queue for this equipment.", HttpStatus.BAD_REQUEST);
        }

        WaitlistEntry entry = WaitlistEntry.builder()
                .equipment(eq)
                .user(user)
                .requestedStart(requestedStart)
                .requestedEnd(requestedEnd)
                .status("Waiting")
                .createdAt(Instant.now())
                .build();

        WaitlistEntry saved = waitlistRepository.save(entry);
        inAppNotificationService.createNotification(user, "Waitlist Joined", "You are now on the waitlist for asset " + eq.getName() + ".", NotificationType.WAITLIST, saved.getWaitlistId());
        return saved;
    }

    @Transactional
    public WaitlistEntry cancelWaitlist(Long waitlistId, String email) {
        WaitlistEntry entry = waitlistRepository.findById(waitlistId)
                .orElseThrow(() -> new ApiException("Waitlist entry not found with id: " + waitlistId, HttpStatus.NOT_FOUND));

        if (!entry.getUser().getEmail().equalsIgnoreCase(email)) {
            throw new ApiException("You do not own this waitlist entry", HttpStatus.FORBIDDEN);
        }

        String oldStatus = entry.getStatus();
        if (oldStatus.equals("Waiting") || oldStatus.equals("Notified")) {
            entry.setStatus("Cancelled");
            waitlistRepository.save(entry);

            // If it was notified, trigger the next person immediately
            if (oldStatus.equals("Notified")) {
                triggerWaitlistSequence(entry.getEquipment());
            }
        } else {
            throw new ApiException("Waitlist entry is already " + oldStatus, HttpStatus.BAD_REQUEST);
        }

        return entry;
    }

    public List<WaitlistEntry> getMyWaitlist(String email) {
        // Run clean-up first to ensure fresh data
        checkExpiredNotifications();
        return waitlistRepository.findByUserEmailOrderByCreatedAtDesc(email);
    }

    public List<WaitlistEntry> getActiveNotifications(String email) {
        // Run clean-up first
        checkExpiredNotifications();
        return waitlistRepository.findByUserEmailAndStatus(email, "Notified");
    }

    @Transactional
    public void triggerWaitlistSequence(Equipment equipment) {
        // Check if there is already a Notified entry for this equipment
        List<WaitlistEntry> notified = waitlistRepository.findByEquipmentEquipmentIdAndStatus(equipment.getEquipmentId(), "Notified");
        if (!notified.isEmpty()) {
            return; // Already has a user in their booking window
        }

        // Get the oldest Waiting entry (FIFO)
        List<WaitlistEntry> waiting = waitlistRepository.findByEquipmentEquipmentIdAndStatusOrderByCreatedAtAsc(equipment.getEquipmentId(), "Waiting");
        if (!waiting.isEmpty()) {
            WaitlistEntry next = waiting.get(0);
            next.setStatus("Notified");
            next.setNotifiedAt(Instant.now());
            waitlistRepository.save(next);

            // Send Email and SMS notification to the waitlisted student
            notificationService.sendWaitlistAvailabilityNotification(next.getUser(), equipment);
            inAppNotificationService.createNotification(next.getUser(), "Equipment Available - 10 Min Window", equipment.getName() + " is now available! You have a 10-minute priority window to book it.", NotificationType.WAITLIST, next.getWaitlistId());
        }
    }

    // Runs every 30 seconds to auto-expire entries that exceeded the 10-minute window
    // and automatically notify the next user if equipment becomes available.
    @Scheduled(fixedRate = 30000)
    @Transactional
    public void checkExpiredNotifications() {
        Instant tenMinutesAgo = Instant.now().minus(10, ChronoUnit.MINUTES);
        List<WaitlistEntry> notified = waitlistRepository.findByStatus("Notified");
        for (WaitlistEntry entry : notified) {
            if (entry.getNotifiedAt() != null && entry.getNotifiedAt().isBefore(tenMinutesAgo)) {
                entry.setStatus("Expired");
                waitlistRepository.save(entry);
                // Trigger the next person in line for this equipment
                triggerWaitlistSequence(entry.getEquipment());
            }
        }

        // Proactively scan for any equipment that is AVAILABLE but has waiting entries and no notified entry
        List<WaitlistEntry> waiting = waitlistRepository.findByStatus("Waiting");
        java.util.Set<Long> processedEqs = new java.util.HashSet<>();
        for (WaitlistEntry entry : waiting) {
            Long eqId = entry.getEquipment().getEquipmentId();
            if (!processedEqs.contains(eqId)) {
                processedEqs.add(eqId);
                Equipment eq = entry.getEquipment();
                if (eq.getStatus() == EquipmentStatus.AVAILABLE && eq.getAmount() != null && eq.getAmount() > 0) {
                    triggerWaitlistSequence(eq);
                }
            }
        }
    }
}
