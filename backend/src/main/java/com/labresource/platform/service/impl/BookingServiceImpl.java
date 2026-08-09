package com.labresource.platform.service.impl;

import com.labresource.platform.dto.BookingResponse;
import com.labresource.platform.dto.CreateBookingRequest;
import com.labresource.platform.dto.RejectBookingRequest;
import com.labresource.platform.entity.Booking;
import com.labresource.platform.entity.BookingStatus;
import com.labresource.platform.entity.Equipment;
import com.labresource.platform.entity.Role;
import com.labresource.platform.entity.User;
import com.labresource.platform.exception.BookingAvailabilityException;
import com.labresource.platform.exception.BookingNotFoundException;
import com.labresource.platform.exception.EquipmentNotFoundException;
import com.labresource.platform.repository.BookingRepository;
import com.labresource.platform.repository.EquipmentRepository;
import com.labresource.platform.service.BookingService;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final EquipmentRepository equipmentRepository;

    public BookingServiceImpl(
            BookingRepository bookingRepository,
            EquipmentRepository equipmentRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.equipmentRepository = equipmentRepository;
    }

    @Override
    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request, Authentication authentication) {
        User user = authenticatedUser(authentication);
        validateBookingCreationAccess(user);
        Equipment equipment = findEquipmentById(request.equipmentId());
        validateQuantity(request.quantity(), equipment);
        validateBookingTime(request.startTime(), request.endTime());

        Booking booking = Booking.builder()
                .user(user)
                .equipment(equipment)
                .quantity(request.quantity())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .purpose(normalizePurpose(request.purpose()))
                .status(BookingStatus.PENDING)
                .build();

        return BookingResponse.from(bookingRepository.saveAndFlush(booking));
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(Authentication authentication) {
        User user = authenticatedUser(authentication);

        return bookingRepository.findByUserId(user.getId())
                .stream()
                .map(BookingResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id, Authentication authentication) {
        User user = authenticatedUser(authentication);
        Booking booking = findBookingById(id);
        validateBookingAccess(booking, user);

        return BookingResponse.from(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(BookingResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByStatus(BookingStatus status) {
        return bookingRepository.findByStatus(status)
                .stream()
                .map(BookingResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public BookingResponse approveBooking(Long id) {
        Booking booking = findBookingById(id);
        validatePendingStatus(booking, "approved");
        validateBookingAvailability(booking);

        booking.setStatus(BookingStatus.APPROVED);
        booking.setRejectionReason(null);

        return BookingResponse.from(bookingRepository.saveAndFlush(booking));
    }

    @Override
    @Transactional
    public BookingResponse rejectBooking(Long id, RejectBookingRequest request) {
        Booking booking = findBookingById(id);
        validatePendingStatus(booking, "rejected");

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(normalizeRejectionReason(request.rejectionReason()));

        return BookingResponse.from(bookingRepository.saveAndFlush(booking));
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(Long id, Authentication authentication) {
        User user = authenticatedUser(authentication);
        Booking booking = findBookingById(id);
        validateBookingCancellationAccess(booking, user);

        if (booking.getStatus() == BookingStatus.COMPLETED || booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalArgumentException("Completed or cancelled bookings cannot be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);

        return BookingResponse.from(bookingRepository.saveAndFlush(booking));
    }

    private Booking findBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new BookingNotFoundException("Booking with id " + id + " was not found"));
    }

    private Equipment findEquipmentById(Long id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() -> new EquipmentNotFoundException("Equipment with id " + id + " was not found"));
    }

    private void validateQuantity(Integer quantity, Equipment equipment) {
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }

        if (quantity > equipment.getQuantity()) {
            throw new IllegalArgumentException("Quantity must not be greater than equipment quantity");
        }
    }

    private void validateBookingTime(LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime == null || endTime == null) {
            throw new IllegalArgumentException("Start time and end time are required");
        }

        if (!startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        if (!endTime.isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("Booking time must not have already ended");
        }
    }

    private void validatePendingStatus(Booking booking, String action) {
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only pending bookings can be " + action);
        }
    }

    private void validateBookingAvailability(Booking booking) {
        List<Booking> overlappingBookings = bookingRepository.findOverlappingByEquipmentIdAndStatus(
                booking.getEquipment().getId(),
                BookingStatus.APPROVED,
                booking.getStartTime(),
                booking.getEndTime()
        );
        int reservedQuantity = overlappingBookings.stream()
                .mapToInt(Booking::getQuantity)
                .sum();
        int requestedQuantity = booking.getQuantity();
        int totalQuantity = booking.getEquipment().getQuantity();

        if (reservedQuantity + requestedQuantity > totalQuantity) {
            throw new BookingAvailabilityException("Insufficient equipment quantity available for the requested time range");
        }
    }

    private void validateBookingAccess(Booking booking, User user) {
        if (canViewAnyBooking(user)) {
            return;
        }

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You cannot access this booking");
        }
    }

    private void validateBookingCreationAccess(User user) {
        if (user.getRole() == Role.ROLE_STUDENT
                || user.getRole() == Role.ROLE_ASSISTANT_PROFESSOR
                || user.getRole() == Role.ROLE_PROFESSOR
                || user.getRole() == Role.ROLE_SYSTEM_ADMIN) {
            return;
        }

        throw new AccessDeniedException("You cannot create bookings");
    }

    private void validateBookingCancellationAccess(Booking booking, User user) {
        if (canCancelAnyBooking(user)) {
            return;
        }

        if (canCancelOwnBooking(user) && booking.getUser().getId().equals(user.getId())) {
            return;
        }

        throw new AccessDeniedException("You cannot cancel this booking");
    }

    private User authenticatedUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new AccessDeniedException("Authenticated user was not found");
        }

        return user;
    }

    private boolean canViewAnyBooking(User user) {
        return user.getRole() == Role.ROLE_LAB_ASSISTANT
                || user.getRole() == Role.ROLE_HOD
                || user.getRole() == Role.ROLE_SYSTEM_ADMIN;
    }

    private boolean canCancelAnyBooking(User user) {
        return user.getRole() == Role.ROLE_LAB_ASSISTANT
                || user.getRole() == Role.ROLE_SYSTEM_ADMIN;
    }

    private boolean canCancelOwnBooking(User user) {
        return user.getRole() == Role.ROLE_STUDENT
                || user.getRole() == Role.ROLE_ASSISTANT_PROFESSOR
                || user.getRole() == Role.ROLE_PROFESSOR;
    }

    private String normalizePurpose(String purpose) {
        if (purpose == null || purpose.isBlank()) {
            throw new IllegalArgumentException("Purpose is required");
        }

        return purpose.trim();
    }

    private String normalizeRejectionReason(String rejectionReason) {
        if (rejectionReason == null || rejectionReason.isBlank()) {
            throw new IllegalArgumentException("Rejection reason is required");
        }

        return rejectionReason.trim();
    }
}
