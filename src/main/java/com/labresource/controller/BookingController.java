package com.labresource.controller;

import com.labresource.dto.BookingRequest;
import com.labresource.entity.*;
import com.labresource.repository.BookingRepository;
import com.labresource.repository.EquipmentRepository;
import com.labresource.repository.SharingRequestRepository;
import com.labresource.repository.UserRepository;
import com.labresource.repository.WaitlistRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingRepository bookingRepository;
    private final EquipmentRepository equipmentRepository;
    private final WaitlistRepository waitlistRepository;
    private final UserRepository userRepository;                     // NEW
    private final SharingRequestRepository sharingRequestRepository; // NEW

    public BookingController(BookingRepository bookingRepository,
                             EquipmentRepository equipmentRepository,
                             WaitlistRepository waitlistRepository,
                             UserRepository userRepository,                     // NEW
                             SharingRequestRepository sharingRequestRepository) { // NEW
        this.bookingRepository = bookingRepository;
        this.equipmentRepository = equipmentRepository;
        this.waitlistRepository = waitlistRepository;
        this.userRepository = userRepository;
        this.sharingRequestRepository = sharingRequestRepository;
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(
            @RequestBody BookingRequest request,
            Authentication authentication) {

        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new RuntimeException("End time cannot be before start time");
        }

        // --- External booking / access management (NEW) ---
        // If this equipment belongs to a specific institution, and the booker belongs
        // to a DIFFERENT institution (or none), an APPROVED sharing request is required.
        if (equipment.getInstitutionId() != null) {
            User booker = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Long bookerInstitutionId = booker.getInstitutionId();

            boolean sameInstitution = bookerInstitutionId != null
                    && bookerInstitutionId.equals(equipment.getInstitutionId());

            if (!sameInstitution) {
                boolean hasApprovedSharing = bookerInstitutionId != null
                        && sharingRequestRepository.existsByEquipmentIdAndRequestingInstitutionIdAndStatus(
                        equipment.getId(), bookerInstitutionId, SharingRequestStatus.APPROVED);

                if (!hasApprovedSharing) {
                    throw new RuntimeException(
                            "This equipment belongs to another institution. You need an approved inter-institution sharing request before booking it."
                    );
                }
            }
        }
        // --- end external booking check ---

        boolean overlaps = bookingRepository.findAll().stream()
                .filter(b -> b.getEquipmentId().equals(request.getEquipmentId()))
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.IN_USE)
                .anyMatch(b ->
                        request.getStartTime().isBefore(b.getEndTime()) &&
                                request.getEndTime().isAfter(b.getStartTime())
                );

        if (overlaps) {
            throw new RuntimeException("Equipment is already booked for this time slot");
        }

        Booking booking = Booking.builder()
                .equipmentId(equipment.getId())
                .equipmentName(equipment.getName())
                .bookedBy(authentication.getName())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(BookingStatus.PENDING_APPROVAL)
                .build();

        return ResponseEntity.ok(bookingRepository.save(booking));
    }

    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingRepository.findAll());
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('LAB_MANAGER')")
    public ResponseEntity<Booking> approveBooking(@PathVariable Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus(BookingStatus.CONFIRMED);
        return ResponseEntity.ok(bookingRepository.save(booking));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('LAB_MANAGER')")
    public ResponseEntity<Booking> cancelBooking(@PathVariable Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);

        // Booking optimization: notify next person in the waitlist for this equipment
        Optional<WaitlistEntry> nextInLine = waitlistRepository
                .findFirstByEquipmentIdAndStatusOrderByCreatedAtAsc(booking.getEquipmentId(), WaitlistStatus.WAITING);

        nextInLine.ifPresent(entry -> {
            entry.setStatus(WaitlistStatus.NOTIFIED);
            entry.setNotifiedAt(LocalDateTime.now());
            waitlistRepository.save(entry);
        });

        return ResponseEntity.ok(saved);
    }
}