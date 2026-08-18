package com.lab.backend.service;

import com.lab.backend.entity.Booking;
import com.lab.backend.entity.Equipment;
import com.lab.backend.enums.BookingStatus;
import com.lab.backend.enums.EquipmentStatus;
import com.lab.backend.exception.CustomExceptions;
import com.lab.backend.repository.BookingRepository;
import com.lab.backend.repository.EquipmentRepository;
import com.lab.backend.repository.MaintenanceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final EquipmentRepository equipmentRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final WaitingListService waitingListService;

    public BookingService(BookingRepository bookingRepository,
                          EquipmentRepository equipmentRepository,
                          MaintenanceRepository maintenanceRepository,
                          WaitingListService waitingListService) {
        this.bookingRepository = bookingRepository;
        this.equipmentRepository = equipmentRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.waitingListService = waitingListService;
    }

    public void recalculateEquipmentStatus(Equipment equipment) {
        if (equipment == null || equipment.getId() == null) return;

        boolean isUnderMaintenance = maintenanceRepository.existsByEquipmentIdAndStatusInIgnoreCase(
                equipment.getId(), Arrays.asList("IN_PROGRESS", "SCHEDULED", "OPEN", "ACTIVE", "UNDER_MAINTENANCE")
        );
        if (isUnderMaintenance) {
            equipment.setStatus(EquipmentStatus.MAINTENANCE);
            equipmentRepository.save(equipment);
            return;
        }

        List<Booking> activeBookings = bookingRepository.findByEquipmentIdAndStatusIn(
                equipment.getId(), Arrays.asList(BookingStatus.APPROVED, BookingStatus.ISSUED, BookingStatus.PENDING)
        );

        boolean hasIssued = activeBookings.stream().anyMatch(b -> b.getStatus() == BookingStatus.ISSUED);
        boolean hasApproved = activeBookings.stream().anyMatch(b -> b.getStatus() == BookingStatus.APPROVED);

        if (hasIssued) {
            equipment.setStatus(EquipmentStatus.BOOKED);
        } else if (hasApproved) {
            equipment.setStatus(EquipmentStatus.RESERVED);
        } else if (equipment.getAvailableQuantity() <= 0) {
            equipment.setStatus(EquipmentStatus.BOOKED);
        } else {
            equipment.setStatus(EquipmentStatus.AVAILABLE);
        }

        equipmentRepository.save(equipment);
    }

    // Create Booking
    public Booking createBooking(Booking booking) {
        if (booking.getBookingDate() == null || booking.getReturnDate() == null) {
            throw new CustomExceptions.BadRequestException("Booking date and return date are required");
        }

        if (booking.getReturnDate().isBefore(booking.getBookingDate())) {
            throw new CustomExceptions.BadRequestException("Booking return date must be on or after booking date");
        }

        if (booking.getEquipment() == null || booking.getEquipment().getId() == null) {
            throw new CustomExceptions.BadRequestException("Equipment selection is required");
        }

        Equipment equipment = equipmentRepository.findById(booking.getEquipment().getId())
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Equipment not found with ID: " + booking.getEquipment().getId()));

        if (equipment.getAvailableQuantity() <= 0) {
            throw new CustomExceptions.BadRequestException("Equipment is currently not available for booking");
        }

        // Check for booking conflicts for the same equipment during requested date range
        List<BookingStatus> activeStatuses = Arrays.asList(BookingStatus.PENDING, BookingStatus.APPROVED, BookingStatus.ISSUED);
        List<Booking> overlapping = bookingRepository.findByEquipmentIdAndStatusInAndBookingDateLessThanEqualAndReturnDateGreaterThanEqual(
                equipment.getId(), activeStatuses, booking.getReturnDate(), booking.getBookingDate()
        );

        if (overlapping.size() >= equipment.getQuantity()) {
            throw new CustomExceptions.ConflictException("Booking conflict: All units of this equipment are reserved for the selected date range.");
        }

        // Reduce available quantity
        equipment.setAvailableQuantity(equipment.getAvailableQuantity() - 1);
        equipmentRepository.save(equipment);

        booking.setEquipment(equipment);
        booking.setStatus(BookingStatus.PENDING);
        Booking savedBooking = bookingRepository.save(booking);

        recalculateEquipmentStatus(equipment);
        return savedBooking;
    }

    // Get All Bookings
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    // Search and Filter Bookings
    public List<Booking> searchAndFilterBookings(Long userId, Long equipmentId, LocalDate bookingDate, BookingStatus status) {
        List<Booking> list = bookingRepository.findAll();

        return list.stream()
                .filter(b -> userId == null || (b.getUser() != null && b.getUser().getId().equals(userId)))
                .filter(b -> equipmentId == null || (b.getEquipment() != null && b.getEquipment().getId().equals(equipmentId)))
                .filter(b -> status == null || b.getStatus() == status)
                .filter(b -> bookingDate == null || (b.getBookingDate() != null && b.getBookingDate().equals(bookingDate)))
                .collect(Collectors.toList());
    }

    // Get Booking By ID
    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Booking not found with ID: " + id));
    }

    // Approve Booking
    public Booking approveBooking(Long id) {
        Booking booking = getBookingById(id);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new CustomExceptions.BadRequestException("Only PENDING bookings can be approved");
        }
        booking.setStatus(BookingStatus.APPROVED);
        Booking saved = bookingRepository.save(booking);

        recalculateEquipmentStatus(saved.getEquipment());
        return saved;
    }

    // Reject Booking
    public Booking rejectBooking(Long id) {
        Booking booking = getBookingById(id);
        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.APPROVED) {
            throw new CustomExceptions.BadRequestException("Booking cannot be rejected in current status: " + booking.getStatus());
        }

        // Restore equipment quantity
        Equipment equipment = booking.getEquipment();
        if (equipment != null) {
            equipment.setAvailableQuantity(equipment.getAvailableQuantity() + 1);
            equipmentRepository.save(equipment);
        }

        booking.setStatus(BookingStatus.REJECTED);
        Booking saved = bookingRepository.save(booking);

        recalculateEquipmentStatus(equipment);
        return saved;
    }

    // Issue Equipment
    public Booking issueEquipment(Long id) {
        Booking booking = getBookingById(id);
        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new CustomExceptions.BadRequestException("Only APPROVED bookings can be issued");
        }
        booking.setStatus(BookingStatus.ISSUED);
        Booking saved = bookingRepository.save(booking);

        recalculateEquipmentStatus(saved.getEquipment());
        return saved;
    }

    // Return Equipment
    @Transactional
    public void returnEquipment(Long bookingId) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        Equipment equipment = booking.getEquipment();

        // Update booking
        booking.setStatus(BookingStatus.COMPLETED);
        booking.setReturnTime(LocalDateTime.now());

        // Update equipment
        if (equipment != null) {
            equipment.setStatus(EquipmentStatus.AVAILABLE);
            equipment.setAvailableQuantity(equipment.getAvailableQuantity() + 1);
            equipmentRepository.save(equipment);
        }

        bookingRepository.save(booking);

        if (equipment != null && waitingListService != null) {
            try {
                waitingListService.allocateNextUser(equipment.getId());
            } catch (Exception ignored) {
            }
        }
    }

    // Cancel Pending Booking
    public Booking cancelBooking(Long id) {
        Booking booking = getBookingById(id);
        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.APPROVED) {
            throw new CustomExceptions.BadRequestException("Only PENDING or APPROVED bookings can be cancelled");
        }

        Equipment equipment = booking.getEquipment();
        if (equipment != null) {
            equipment.setAvailableQuantity(equipment.getAvailableQuantity() + 1);
            equipmentRepository.save(equipment);
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);

        recalculateEquipmentStatus(equipment);
        return saved;
    }
}