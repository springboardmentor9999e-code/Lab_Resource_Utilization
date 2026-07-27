package com.labresource.service.impl;

import com.labresource.dto.request.BookingRequest;
import com.labresource.dto.request.RecurringBookingRequest;
import com.labresource.dto.response.BookingHistoryResponse;
import com.labresource.dto.response.BookingResponse;
import com.labresource.dto.response.RecurringBookingResponse;
import com.labresource.entity.AppUser;
import com.labresource.entity.Booking;
import com.labresource.entity.BookingHistory;
import com.labresource.entity.Equipment;
import com.labresource.entity.RecurringBooking;
import com.labresource.event.BookingStatusChangedEvent;
import com.labresource.repository.AppUserRepository;
import com.labresource.repository.BookingHistoryRepository;
import com.labresource.repository.BookingRepository;
import com.labresource.repository.EquipmentRepository;
import com.labresource.repository.RecurringBookingRepository;
import com.labresource.service.interfaces.BookingService;
import com.labresource.service.interfaces.WaitlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    // Booking status model (doc spec):
    // PENDING -> CONFIRMED | REJECTED | CANCELLED
    // CONFIRMED -> IN_USE | CANCELLED | NO_SHOW
    // IN_USE -> COMPLETED
    // Terminal: COMPLETED, CANCELLED, REJECTED, NO_SHOW
    private static final Map<String, Set<String>> ALLOWED_TRANSITIONS = Map.of(
            "PENDING", Set.of("CONFIRMED", "REJECTED", "CANCELLED"),
            "CONFIRMED", Set.of("IN_USE", "CANCELLED", "NO_SHOW"),
            "IN_USE", Set.of("COMPLETED")
    );

    private static final Set<String> APPROVER_ROLES = Set.of(
            "ROLE_SYSTEM_ADMIN", "ROLE_DEPARTMENT_HEAD", "ROLE_LAB_MANAGER");

    private static final Set<String> OPERATOR_ROLES = Set.of(
            "ROLE_SYSTEM_ADMIN", "ROLE_DEPARTMENT_HEAD", "ROLE_LAB_MANAGER", "ROLE_LAB_TECHNICIAN");

    private final BookingRepository bookingRepository;
    private final BookingHistoryRepository bookingHistoryRepository;
    private final RecurringBookingRepository recurringBookingRepository;
    private final EquipmentRepository equipmentRepository;
    private final AppUserRepository appUserRepository;
    private final WaitlistService waitlistService;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public BookingResponse createBooking(BookingRequest request, String username) {
        AppUser user = appUserRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Logged-in user not found"));

        Equipment eq = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        if (request.getBookingDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Booking date cannot be in the past");
        }
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new RuntimeException("End time must be after start time");
        }
        if ("UNDER_MAINTENANCE".equalsIgnoreCase(eq.getStatus())) {
            throw new RuntimeException("Equipment is currently under maintenance");
        }

        boolean hasOverlap = bookingRepository.hasOverlappingBooking(
                eq.getEquipmentId(),
                request.getBookingDate(),
                request.getStartTime(),
                request.getEndTime()
        );

        if (hasOverlap) {
            // Frontend detects the 'SLOT_TAKEN:' prefix to offer joining the waitlist.
            throw new RuntimeException("SLOT_TAKEN: This equipment is already booked for the selected time slot. You can join the waitlist to be notified when it frees up.");
        }

        Booking booking = Booking.builder()
                .user(user)
                .equipment(eq)
                .bookingDate(request.getBookingDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status("PENDING")
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        // If the user was NOTIFIED on the waitlist for this equipment + date, they converted.
        waitlistService.markConvertedIfNotified(
                user.getUserId(), eq.getEquipmentId(), request.getBookingDate());

        recordHistory(savedBooking, null, savedBooking.getStatus(), username, "Booking created");

        publishStatusEvent(savedBooking, null, savedBooking.getStatus());

        return mapToResponse(savedBooking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(String username) {
        AppUser user = appUserRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return bookingRepository.findByUser_UserId(user.getUserId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BookingResponse updateBookingStatus(Long id, String status, String callerUsername) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking request not found"));

        String newStatus = normalizeStatus(status);
        String oldStatus = normalizeStatus(booking.getStatus());

        validateTransition(oldStatus, newStatus);
        enforceRoleGate(newStatus, booking, callerUsername);

        booking.setStatus(newStatus);

        syncEquipmentStatus(booking.getEquipment(), newStatus);

        Booking updatedBooking = bookingRepository.save(booking);

        // Freeing a slot? Promote the next waitlist entry for that equipment + date.
        if ("CANCELLED".equals(newStatus) || "REJECTED".equals(newStatus)) {
            waitlistService.notifyNextInLine(
                    updatedBooking.getEquipment().getEquipmentId(),
                    updatedBooking.getBookingDate());
        }

        sendDecisionEmail(updatedBooking, newStatus);

        recordHistory(updatedBooking, oldStatus, newStatus, callerUsername, null);

        publishStatusEvent(updatedBooking, oldStatus, newStatus);

        return mapToResponse(updatedBooking);
    }

    // ------------------------------------------------------------------
    // Audit trail
    // ------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public List<BookingHistoryResponse> getBookingHistory(Long bookingId, String callerUsername) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        boolean isOwner = booking.getUser().getUsername().equals(callerUsername);
        boolean isManager = currentAuthorities().stream().anyMatch(OPERATOR_ROLES::contains);
        if (!isOwner && !isManager) {
            throw new RuntimeException("You can only view the history of your own bookings");
        }

        return bookingHistoryRepository.findByBooking_BookingIdOrderByChangedAtAsc(bookingId).stream()
                .map(h -> BookingHistoryResponse.builder()
                        .historyId(h.getHistoryId())
                        .oldStatus(h.getOldStatus())
                        .newStatus("APPROVED".equals(h.getNewStatus()) ? "CONFIRMED" : h.getNewStatus())
                        .changedBy(h.getChangedBy())
                        .remarks(h.getRemarks())
                        .changedAt(h.getChangedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private void recordHistory(Booking booking, String oldStatus, String newStatus,
                               String changedBy, String remarks) {
        bookingHistoryRepository.save(BookingHistory.builder()
                .booking(booking)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .changedBy(changedBy)
                .remarks(remarks)
                .build());
    }

    // ------------------------------------------------------------------
    // Availability calendar
    // ------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsInRange(LocalDate from, LocalDate to, Long equipmentId) {
        if (from == null || to == null) {
            throw new RuntimeException("Both 'from' and 'to' dates are required");
        }
        if (to.isBefore(from)) {
            throw new RuntimeException("'to' date must not be before 'from' date");
        }
        if (from.plusMonths(3).isBefore(to)) {
            throw new RuntimeException("Calendar range cannot exceed 3 months");
        }
        return bookingRepository.findActiveInRange(from, to, equipmentId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ------------------------------------------------------------------
    // Recurring bookings
    // ------------------------------------------------------------------

    private static final int MAX_OCCURRENCES = 60;

    @Override
    @Transactional
    public RecurringBookingResponse createRecurringBooking(RecurringBookingRequest request, String username) {
        AppUser user = appUserRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Logged-in user not found"));

        Equipment eq = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        String frequency = request.getFrequency() == null ? "" : request.getFrequency().trim().toUpperCase();
        if (!"DAILY".equals(frequency) && !"WEEKLY".equals(frequency)) {
            throw new RuntimeException("Frequency must be DAILY or WEEKLY");
        }
        if (request.getStartDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Start date cannot be in the past");
        }
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new RuntimeException("End date must not be before start date");
        }
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new RuntimeException("End time must be after start time");
        }
        if ("UNDER_MAINTENANCE".equalsIgnoreCase(eq.getStatus())) {
            throw new RuntimeException("Equipment is currently under maintenance");
        }

        // Generate the occurrence dates first so we can enforce the series cap.
        List<LocalDate> dates = new ArrayList<>();
        int step = "DAILY".equals(frequency) ? 1 : 7;
        for (LocalDate d = request.getStartDate(); !d.isAfter(request.getEndDate()); d = d.plusDays(step)) {
            dates.add(d);
        }
        if (dates.size() > MAX_OCCURRENCES) {
            throw new RuntimeException("Series would create " + dates.size()
                    + " bookings — the maximum is " + MAX_OCCURRENCES
                    + ". Shorten the date range.");
        }

        RecurringBooking series = recurringBookingRepository.save(RecurringBooking.builder()
                .user(user)
                .equipment(eq)
                .frequency(frequency)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status("ACTIVE")
                .build());

        List<LocalDate> skipped = new ArrayList<>();
        int created = 0;
        for (LocalDate date : dates) {
            boolean overlap = bookingRepository.hasOverlappingBooking(
                    eq.getEquipmentId(), date, request.getStartTime(), request.getEndTime());
            if (overlap) {
                skipped.add(date);
                continue;
            }
            Booking occurrence = bookingRepository.save(Booking.builder()
                    .user(user)
                    .equipment(eq)
                    .bookingDate(date)
                    .startTime(request.getStartTime())
                    .endTime(request.getEndTime())
                    .status("PENDING")
                    .recurringBooking(series)
                    .build());
            recordHistory(occurrence, null, "PENDING", username,
                    "Created by " + frequency.toLowerCase() + " recurring series #" + series.getRecurringId());
            publishStatusEvent(occurrence, null, "PENDING");
            created++;
        }

        if (created == 0) {
            throw new RuntimeException("SLOT_TAKEN: Every date in the series conflicts with existing bookings. "
                    + "Choose a different time or join the waitlist for individual days.");
        }

        series.setOccurrencesCreated(created);
        series.setOccurrencesSkipped(skipped.size());
        recurringBookingRepository.save(series);

        return mapToRecurringResponse(series, skipped);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecurringBookingResponse> getMyRecurringBookings(String username) {
        AppUser user = appUserRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return recurringBookingRepository.findByUser_UserIdOrderByCreatedAtDesc(user.getUserId()).stream()
                .map(s -> mapToRecurringResponse(s, null))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RecurringBookingResponse cancelRecurringBooking(Long recurringId, String callerUsername) {
        RecurringBooking series = recurringBookingRepository.findById(recurringId)
                .orElseThrow(() -> new RuntimeException("Recurring booking series not found"));

        boolean isOwner = series.getUser().getUsername().equals(callerUsername);
        boolean isManager = currentAuthorities().stream().anyMatch(APPROVER_ROLES::contains);
        if (!isOwner && !isManager) {
            throw new RuntimeException("Only the series owner or a manager can cancel a recurring booking");
        }
        if ("CANCELLED".equals(series.getStatus())) {
            throw new RuntimeException("This recurring series is already cancelled");
        }

        // Cancel every still-active occurrence (each freeing its waitlist slot).
        List<Booking> active = bookingRepository.findByRecurringBooking_RecurringIdAndStatusIn(
                recurringId, List.of("PENDING", "APPROVED", "CONFIRMED"));
        for (Booking b : active) {
            String old = normalizeStatus(b.getStatus());
            b.setStatus("CANCELLED");
            syncEquipmentStatus(b.getEquipment(), "CANCELLED");
            bookingRepository.save(b);
            waitlistService.notifyNextInLine(b.getEquipment().getEquipmentId(), b.getBookingDate());
            recordHistory(b, old, "CANCELLED", callerUsername, "Recurring series cancelled");
            publishStatusEvent(b, old, "CANCELLED");
        }

        series.setStatus("CANCELLED");
        recurringBookingRepository.save(series);

        return mapToRecurringResponse(series, null);
    }

    private RecurringBookingResponse mapToRecurringResponse(RecurringBooking s, List<LocalDate> skippedDates) {
        return RecurringBookingResponse.builder()
                .recurringId(s.getRecurringId())
                .equipmentId(s.getEquipment().getEquipmentId())
                .equipmentName(s.getEquipment().getEquipmentName())
                .equipmentCode(s.getEquipment().getEquipmentCode())
                .username(s.getUser().getUsername())
                .frequency(s.getFrequency())
                .startDate(s.getStartDate())
                .endDate(s.getEndDate())
                .startTime(s.getStartTime())
                .endTime(s.getEndTime())
                .status(s.getStatus())
                .occurrencesCreated(s.getOccurrencesCreated())
                .occurrencesSkipped(s.getOccurrencesSkipped())
                .skippedDates(skippedDates)
                .createdAt(s.getCreatedAt())
                .build();
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    /** Legacy value APPROVED is treated as CONFIRMED everywhere. */
    private String normalizeStatus(String status) {
        if (status == null) {
            throw new RuntimeException("Booking status is required");
        }
        String upper = status.trim().toUpperCase();
        if ("APPROVED".equals(upper)) {
            return "CONFIRMED";
        }
        Set<String> known = Set.of("PENDING", "CONFIRMED", "IN_USE", "COMPLETED",
                "CANCELLED", "NO_SHOW", "REJECTED");
        if (!known.contains(upper)) {
            throw new RuntimeException("Invalid booking status value: " + status
                    + ". Use CONFIRMED, REJECTED, IN_USE, COMPLETED, NO_SHOW or CANCELLED");
        }
        return upper;
    }

    private void validateTransition(String oldStatus, String newStatus) {
        Set<String> allowed = ALLOWED_TRANSITIONS.get(oldStatus);
        if (allowed == null) {
            throw new RuntimeException("Booking is already " + oldStatus + " (terminal) and cannot change status");
        }
        if (!allowed.contains(newStatus)) {
            throw new RuntimeException("Illegal status transition: " + oldStatus + " -> " + newStatus);
        }
    }

    /**
     * Permission gates enforced in-service (the controller endpoint stays open
     * to all authenticated users for backward compatibility):
     *  - CONFIRMED / REJECTED: SYSTEM_ADMIN, DEPARTMENT_HEAD, LAB_MANAGER
     *  - IN_USE / COMPLETED / NO_SHOW: those roles + LAB_TECHNICIAN
     *  - CANCELLED: booking owner OR the manager roles
     */
    private void enforceRoleGate(String newStatus, Booking booking, String callerUsername) {
        Set<String> authorities = currentAuthorities();

        switch (newStatus) {
            case "CONFIRMED", "REJECTED" -> {
                if (authorities.stream().noneMatch(APPROVER_ROLES::contains)) {
                    throw new RuntimeException("Only System Admin, Department Head or Lab Manager can approve or reject bookings");
                }
            }
            case "IN_USE", "COMPLETED", "NO_SHOW" -> {
                if (authorities.stream().noneMatch(OPERATOR_ROLES::contains)) {
                    throw new RuntimeException("Only System Admin, Department Head, Lab Manager or Lab Technician can perform this action");
                }
            }
            case "CANCELLED" -> {
                boolean isOwner = booking.getUser().getUsername().equals(callerUsername);
                boolean isManager = authorities.stream().anyMatch(APPROVER_ROLES::contains);
                if (!isOwner && !isManager) {
                    throw new RuntimeException("Only the booking owner or a manager can cancel this booking");
                }
            }
            default -> throw new RuntimeException("Unsupported status change: " + newStatus);
        }
    }

    private Set<String> currentAuthorities() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return Set.of();
        }
        return auth.getAuthorities().stream()
                .map(Object::toString)
                .collect(Collectors.toSet());
    }

    /**
     * Equipment status sync — never clobber UNDER_MAINTENANCE / OUT_OF_SERVICE etc.
     * when releasing a slot: only reset to AVAILABLE from RESERVED or IN_USE.
     */
    private void syncEquipmentStatus(Equipment eq, String bookingStatus) {
        switch (bookingStatus) {
            case "CONFIRMED" -> {
                eq.setStatus("RESERVED");
                equipmentRepository.save(eq);
            }
            case "IN_USE" -> {
                eq.setStatus("IN_USE");
                equipmentRepository.save(eq);
            }
            case "COMPLETED", "CANCELLED", "REJECTED", "NO_SHOW" -> {
                if ("RESERVED".equals(eq.getStatus()) || "IN_USE".equals(eq.getStatus())) {
                    eq.setStatus("AVAILABLE");
                    equipmentRepository.save(eq);
                }
            }
            default -> {
                // PENDING and others: no equipment change
            }
        }
    }

    private void sendDecisionEmail(Booking booking, String newStatus) {
        if (!"CONFIRMED".equals(newStatus) && !"REJECTED".equals(newStatus)) {
            return;
        }
        String equipmentName = booking.getEquipment().getEquipmentName();
        String subject;
        String body;
        if ("CONFIRMED".equals(newStatus)) {
            subject = "Lab Resource Platform — Booking Confirmed";
            body = "Hi " + booking.getUser().getFirstName() + ",\n\n"
                    + "Your booking for " + equipmentName + " on " + booking.getBookingDate()
                    + " (" + booking.getStartTime() + " - " + booking.getEndTime() + ") has been CONFIRMED.\n\n"
                    + "— Lab Resource Platform Team";
        } else {
            subject = "Lab Resource Platform — Booking Rejected";
            body = "Hi " + booking.getUser().getFirstName() + ",\n\n"
                    + "Your booking for " + equipmentName + " on " + booking.getBookingDate()
                    + " (" + booking.getStartTime() + " - " + booking.getEndTime() + ") was REJECTED.\n"
                    + "Please contact the lab manager or book a different slot.\n\n"
                    + "— Lab Resource Platform Team";
        }
        emailService.sendNotificationEmail(booking.getUser().getEmail(), subject, body);

        // In-app alert mirroring the email
        boolean confirmed = "CONFIRMED".equals(newStatus);
        notificationService.notifyInApp(
                booking.getUser(),
                "BOOKING",
                confirmed ? "Booking Confirmed" : "Booking Rejected",
                (confirmed ? "Your booking for " : "Your booking request for ") + equipmentName
                        + " on " + booking.getBookingDate() + " ("
                        + booking.getStartTime() + " - " + booking.getEndTime() + ") was "
                        + (confirmed ? "confirmed." : "rejected."),
                "/dashboard/bookings");
    }

    /** Published AFTER save — consumed by the Utilization Monitoring module. */
    private void publishStatusEvent(Booking booking, String oldStatus, String newStatus) {
        eventPublisher.publishEvent(BookingStatusChangedEvent.builder()
                .bookingId(booking.getBookingId())
                .equipmentId(booking.getEquipment().getEquipmentId())
                .userId(booking.getUser().getUserId())
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .bookingDate(booking.getBookingDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .build());
    }

    private BookingResponse mapToResponse(Booking booking) {
        String roleStr = "STUDENT";
        if (booking.getUser().getUserRoles() != null && !booking.getUser().getUserRoles().isEmpty()) {
            roleStr = booking.getUser().getUserRoles().iterator().next().getRole().getRoleName();
        }

        // Surface legacy APPROVED rows as CONFIRMED without touching the DB row here
        String displayStatus = "APPROVED".equals(booking.getStatus()) ? "CONFIRMED" : booking.getStatus();

        return BookingResponse.builder()
                .bookingId(booking.getBookingId())
                .userId(booking.getUser().getUserId())
                .username(booking.getUser().getUsername())
                .userFullName(booking.getUser().getFirstName() + " " + booking.getUser().getLastName())
                .userRole(roleStr)
                .equipmentId(booking.getEquipment().getEquipmentId())
                .equipmentName(booking.getEquipment().getEquipmentName())
                .equipmentCode(booking.getEquipment().getEquipmentCode())
                .labName(booking.getEquipment().getLab() != null ? booking.getEquipment().getLab().getName() : "Unallocated")
                .bookingDate(booking.getBookingDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .status(displayStatus)
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
