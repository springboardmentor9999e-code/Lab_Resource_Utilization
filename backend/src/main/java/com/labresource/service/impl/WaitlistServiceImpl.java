package com.labresource.service.impl;

import com.labresource.dto.response.WaitlistResponse;
import com.labresource.entity.AppUser;
import com.labresource.entity.Equipment;
import com.labresource.entity.Waitlist;
import com.labresource.repository.AppUserRepository;
import com.labresource.repository.EquipmentRepository;
import com.labresource.repository.WaitlistRepository;
import com.labresource.service.interfaces.WaitlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WaitlistServiceImpl implements WaitlistService {

    private static final List<String> ACTIVE_STATUSES = List.of("WAITING", "NOTIFIED");

    /**
     * How long a notified user keeps their claim on a freed slot before it passes on.
     * Long enough that someone who is notified overnight still gets a fair chance to act.
     */
    @Value("${app.waitlist.offer-window-hours:24}")
    private int offerWindowHours;

    private final WaitlistRepository waitlistRepository;
    private final EquipmentRepository equipmentRepository;
    private final AppUserRepository appUserRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public WaitlistResponse joinWaitlist(Long equipmentId, LocalDate requestedDate,
                                         LocalTime startTime, LocalTime endTime, String username) {
        AppUser user = appUserRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Logged-in user not found"));

        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        if (requestedDate == null || requestedDate.isBefore(LocalDate.now())) {
            throw new RuntimeException("Requested date cannot be in the past");
        }
        if (startTime != null && endTime != null && !endTime.isAfter(startTime)) {
            throw new RuntimeException("End time must be after start time");
        }

        boolean duplicate = waitlistRepository
                .existsByUser_UserIdAndEquipment_EquipmentIdAndRequestedDateAndStatusIn(
                        user.getUserId(), equipmentId, requestedDate, ACTIVE_STATUSES);
        if (duplicate) {
            throw new RuntimeException("You are already on the waitlist for this equipment on that date");
        }

        long waitingCount = waitlistRepository
                .countByEquipment_EquipmentIdAndRequestedDateAndStatus(equipmentId, requestedDate, "WAITING");

        Waitlist entry = Waitlist.builder()
                .equipment(equipment)
                .user(user)
                .requestedDate(requestedDate)
                .startTime(startTime)
                .endTime(endTime)
                .priority((int) waitingCount + 1)
                .status("WAITING")
                .build();

        Waitlist saved = waitlistRepository.save(entry);
        return mapToResponse(saved, resolvePosition(saved));
    }

    @Override
    @Transactional(readOnly = true)
    public List<WaitlistResponse> getMyWaitlist(String username) {
        AppUser user = appUserRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return waitlistRepository.findByUser_UserIdOrderByRequestedAtDesc(user.getUserId()).stream()
                .map(w -> mapToResponse(w, resolvePosition(w)))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<WaitlistResponse> getAllActiveEntries() {
        return waitlistRepository.findByStatusInOrderByRequestedAtAsc(ACTIVE_STATUSES).stream()
                .map(w -> mapToResponse(w, resolvePosition(w)))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public WaitlistResponse cancelWaitlistEntry(Long waitlistId, String username, boolean isManager) {
        Waitlist entry = waitlistRepository.findById(waitlistId)
                .orElseThrow(() -> new RuntimeException("Waitlist entry not found"));

        boolean isOwner = entry.getUser().getUsername().equals(username);
        if (!isOwner && !isManager) {
            throw new RuntimeException("You are not allowed to cancel this waitlist entry");
        }
        if (!ACTIVE_STATUSES.contains(entry.getStatus())) {
            throw new RuntimeException("Only WAITING or NOTIFIED entries can be cancelled");
        }

        entry.setStatus("CANCELLED");
        Waitlist saved = waitlistRepository.save(entry);
        return mapToResponse(saved, null);
    }

    @Override
    @Transactional
    public void notifyNextInLine(Long equipmentId, LocalDate date) {
        // A slot may carry only one live offer. If the incumbent's window has lapsed, release it
        // first so the slot can move on; if it is still live, leave it alone — that user's claim
        // has not run out yet and handing the same slot to two people would be worse than waiting.
        Optional<Waitlist> outstanding = waitlistRepository.findOutstandingOffer(equipmentId, date);
        if (outstanding.isPresent()) {
            Waitlist held = outstanding.get();
            if (!hasLapsed(held)) {
                return;
            }
            releaseLapsedOffer(held);
        }

        promoteNextWaiting(equipmentId, date);
    }

    @Override
    @Transactional
    public int expireLapsedOffers() {
        List<Waitlist> lapsed = waitlistRepository.findLapsedOffers(LocalDateTime.now());
        for (Waitlist entry : lapsed) {
            Long equipmentId = entry.getEquipment().getEquipmentId();
            LocalDate date = entry.getRequestedDate();

            releaseLapsedOffer(entry);
            // The slot is free again — hand it to whoever is next rather than dropping it
            promoteNextWaiting(equipmentId, date);
        }

        // Entries for dates that have already passed can never convert; close them out so they
        // stop showing as active on users' waitlist tabs.
        List<Waitlist> stale = waitlistRepository.findStaleByDate(LocalDate.now());
        for (Waitlist entry : stale) {
            entry.setStatus("EXPIRED");
        }
        if (!stale.isEmpty()) {
            waitlistRepository.saveAll(stale);
        }

        return lapsed.size();
    }

    /** Marks a lapsed offer EXPIRED and tells the user their claim ran out. */
    private void releaseLapsedOffer(Waitlist entry) {
        entry.setStatus("EXPIRED");
        waitlistRepository.save(entry);

        notificationService.notifyInApp(
                entry.getUser(),
                "WAITLIST",
                "Waitlist Offer Expired",
                "Your reserved claim on " + entry.getEquipment().getEquipmentName()
                        + " for " + entry.getRequestedDate()
                        + " expired before it was booked, so the slot has passed to the next person"
                        + " in line. You can rejoin the waitlist if you still need it.",
                "/dashboard/bookings");
    }

    /** Promotes the oldest WAITING entry for the slot to NOTIFIED, with a bounded claim window. */
    private void promoteNextWaiting(Long equipmentId, LocalDate date) {
        Optional<Waitlist> next = waitlistRepository.findNextWaiting(equipmentId, date);
        if (next.isEmpty()) {
            return;
        }
        Waitlist entry = next.get();
        LocalDateTime now = LocalDateTime.now();

        entry.setStatus("NOTIFIED");
        entry.setNotifiedAt(now);
        entry.setOfferExpiresAt(now.plusHours(offerWindowHours));
        waitlistRepository.save(entry);

        String equipmentName = entry.getEquipment().getEquipmentName();

        // Urgent: the claim is time-boxed, so an alert the user only sees tomorrow is worthless.
        notificationService.notifyUrgent(
                entry.getUser(),
                "WAITLIST",
                "Waitlist Slot Available",
                "A slot for " + equipmentName + " on " + date + " has been freed and is held for you"
                        + " until " + entry.getOfferExpiresAt() + " (" + offerWindowHours
                        + " hours). Book it before the claim lapses, or it passes to the next"
                        + " person on the waitlist.",
                "/dashboard/bookings",
                equipmentName + " is free on " + date + " — held for you for "
                        + offerWindowHours + "h. Book now.");
    }

    private boolean hasLapsed(Waitlist entry) {
        // A legacy row notified before offer windows existed has no deadline; treat it as lapsed
        // rather than letting it block the queue forever.
        return entry.getOfferExpiresAt() == null
                || entry.getOfferExpiresAt().isBefore(LocalDateTime.now());
    }

    @Override
    @Transactional
    public void markConvertedIfNotified(Long userId, Long equipmentId, LocalDate date) {
        waitlistRepository.findNotifiedEntry(userId, equipmentId, date).ifPresent(entry -> {
            entry.setStatus("CONVERTED");
            // Claim satisfied — drop the deadline so the expiry sweep skips this row
            entry.setOfferExpiresAt(null);
            waitlistRepository.save(entry);
        });
    }

    /** Whole hours left on a live offer; null when the entry holds no offer, never negative. */
    private Long offerHoursRemaining(Waitlist entry) {
        if (!"NOTIFIED".equals(entry.getStatus()) || entry.getOfferExpiresAt() == null) {
            return null;
        }
        long hours = ChronoUnit.HOURS.between(LocalDateTime.now(), entry.getOfferExpiresAt());
        return Math.max(0, hours);
    }

    // 1-based rank among active entries for the same equipment + date; null when terminal
    private Integer resolvePosition(Waitlist entry) {
        if (!ACTIVE_STATUSES.contains(entry.getStatus())) {
            return null;
        }
        List<Waitlist> queue = waitlistRepository.findActiveQueue(
                entry.getEquipment().getEquipmentId(), entry.getRequestedDate());
        for (int i = 0; i < queue.size(); i++) {
            if (queue.get(i).getWaitlistId().equals(entry.getWaitlistId())) {
                return i + 1;
            }
        }
        return null;
    }

    private WaitlistResponse mapToResponse(Waitlist w, Integer position) {
        return WaitlistResponse.builder()
                .waitlistId(w.getWaitlistId())
                .equipmentId(w.getEquipment().getEquipmentId())
                .equipmentName(w.getEquipment().getEquipmentName())
                .equipmentCode(w.getEquipment().getEquipmentCode())
                .labName(w.getEquipment().getLab() != null ? w.getEquipment().getLab().getName() : "Unallocated")
                .userId(w.getUser().getUserId())
                .username(w.getUser().getUsername())
                .userFullName(w.getUser().getFirstName() + " " + w.getUser().getLastName())
                .requestedDate(w.getRequestedDate())
                .startTime(w.getStartTime())
                .endTime(w.getEndTime())
                .priority(w.getPriority())
                .status(w.getStatus())
                .requestedAt(w.getRequestedAt())
                .notifiedAt(w.getNotifiedAt())
                .offerExpiresAt(w.getOfferExpiresAt())
                .offerHoursRemaining(offerHoursRemaining(w))
                .position(position)
                .build();
    }
}
