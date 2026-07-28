package com.lrplatform.service;

import com.lrplatform.annotation.Auditable;
import com.lrplatform.dto.response.BookingWaitlistResponse;
import com.lrplatform.exception.BadRequestException;
import com.lrplatform.exception.ResourceNotFoundException;
import com.lrplatform.model.entity.*;
import com.lrplatform.model.enums.BookingStatus;
import com.lrplatform.model.enums.EquipmentStatus;
import com.lrplatform.model.enums.NotificationPriority;
import com.lrplatform.model.enums.NotificationType;
import com.lrplatform.model.enums.UserRole;
import com.lrplatform.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookingHistoryRepository bookingHistoryRepository;
    private final BookingWaitlistRepository waitlistRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final InvoiceService invoiceService;

    @Transactional(readOnly = true)
    public List<Booking> getFilteredBookings(User user) {
        UserRole role = user.getRole();
        return switch (role) {
            case SYSTEM_ADMIN -> bookingRepository.findAll();
            case INSTITUTION_ADMIN -> user.getInstitution() != null
                    ? bookingRepository.findByEquipmentInstitutionId(user.getInstitution().getId())
                    : List.of();
            case DEPARTMENT_HEAD, LAB_MANAGER -> user.getDepartment() != null
                    ? bookingRepository.findByEquipmentDepartmentId(user.getDepartment().getId())
                    : List.of();
            default -> bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        };
    }

    @Transactional(readOnly = true)
    public List<Booking> getMyBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public Booking getBookingById(Long id) {
        return bookingRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Booking> getPendingApprovals() {
        return bookingRepository.findByStatus(BookingStatus.PENDING_APPROVAL);
    }

    @Transactional(readOnly = true)
    public List<Booking> getPendingApprovalsByDepartment(Long departmentId) {
        return bookingRepository.findByStatusAndEquipmentDepartmentId(BookingStatus.PENDING_APPROVAL, departmentId);
    }

    @Auditable(module = "BOOKING", action = "CREATE", entityType = "Booking")
    @Transactional
    public Booking createBooking(Booking booking, Long userId) {
        Equipment equipment = equipmentRepository.findById(Objects.requireNonNull(booking.getEquipment().getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found"));

        User user = userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (equipment.getStatus() != EquipmentStatus.AVAILABLE) {
            throw new BadRequestException("Equipment is not available for booking");
        }

        if (booking.getBookingDate() == null) {
            throw new BadRequestException("Booking date is required");
        }

        if (booking.getBookingDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Booking date cannot be in the past");
        }

        if (booking.getBookingDate().isAfter(LocalDate.now().plusDays(30))) {
            throw new BadRequestException("Booking date must be within 30 days from today");
        }

        if (booking.getStartTime() == null || booking.getEndTime() == null) {
            throw new BadRequestException("Start time and end time are required");
        }

        if (!booking.getEndTime().isAfter(booking.getStartTime())) {
            throw new BadRequestException("End time must be after start time");
        }

        if (booking.getStartTime().isBefore(LocalTime.of(8, 0)) ||
            booking.getEndTime().isAfter(LocalTime.of(18, 30))) {
            throw new BadRequestException("Booking must be between 08:00 and 18:30");
        }

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                equipment.getId(),
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime()
        );

        if (!conflicts.isEmpty()) {
            throw new BadRequestException("Time slot conflicts with an existing booking");
        }

        booking.setEquipment(equipment);
        booking.setUser(user);
        booking.setStatus(BookingStatus.PENDING_APPROVAL);
        Booking saved = bookingRepository.save(booking);

        BookingHistory history = BookingHistory.builder()
                .booking(saved)
                .status(BookingStatus.PENDING_APPROVAL.name())
                .remarks("Booking created")
                .updatedBy(user)
                .build();
        bookingHistoryRepository.save(Objects.requireNonNull(history));

        // Create recurring child bookings if pattern is set
        if (booking.getRecurrencePattern() != null && !booking.getRecurrencePattern().isEmpty()
                && booking.getRecurrenceEndDate() != null) {
            saved.setRecurrenceParentId(saved.getId());
            bookingRepository.save(saved);
            createRecurringBookings(saved, equipment, user);
        }

        // Notify lab managers about new booking request
        notifyLabManagers(equipment, user, saved);

        return saved;
    }

    @Auditable(module = "BOOKING", action = "APPROVE", entityType = "Booking")
    @Transactional
    public Booking approveBooking(Long bookingId, Long managerId, String remarks) {
        Booking booking = getBookingById(bookingId);
        User manager = userRepository.findById(Objects.requireNonNull(managerId))
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));

        if (manager.getRole() == UserRole.DEPARTMENT_HEAD) {
            validateBookingBelongsToDepartment(booking, manager);
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setApprovedBy(manager);
        booking.setApprovedAt(LocalDateTime.now());
        booking.setRemarks(remarks);

        Booking saved = bookingRepository.save(booking);

        BookingHistory history = BookingHistory.builder()
                .booking(saved)
                .status(BookingStatus.APPROVED.name())
                .remarks(remarks)
                .updatedBy(manager)
                .build();
        bookingHistoryRepository.save(Objects.requireNonNull(history));

        // Notify user that booking was approved
        notificationService.createNotification(
                booking.getUser(),
                "Booking Approved",
                "Your booking for " + booking.getEquipment().getEquipmentName() +
                        " on " + booking.getBookingDate() + " has been approved.",
                NotificationType.BOOKING_APPROVED,
                NotificationPriority.MEDIUM
        );

        return saved;
    }

    @Auditable(module = "BOOKING", action = "REJECT", entityType = "Booking")
    @Transactional
    public Booking rejectBooking(Long bookingId, Long managerId, String remarks) {
        Booking booking = getBookingById(bookingId);
        User manager = userRepository.findById(Objects.requireNonNull(managerId))
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));

        if (manager.getRole() == UserRole.DEPARTMENT_HEAD) {
            validateBookingBelongsToDepartment(booking, manager);
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setApprovedBy(manager);
        booking.setRemarks(remarks);

        Booking saved = bookingRepository.save(booking);

        BookingHistory history = BookingHistory.builder()
                .booking(saved)
                .status(BookingStatus.REJECTED.name())
                .remarks(remarks)
                .updatedBy(manager)
                .build();
        bookingHistoryRepository.save(Objects.requireNonNull(history));

        // Notify user that booking was rejected
        notificationService.createNotification(
                booking.getUser(),
                "Booking Rejected",
                "Your booking for " + booking.getEquipment().getEquipmentName() +
                        " on " + booking.getBookingDate() + " has been rejected." +
                        (remarks != null ? " Reason: " + remarks : ""),
                NotificationType.BOOKING_REJECTED,
                NotificationPriority.HIGH
        );

        promoteFromWaitlist(booking.getEquipment().getId());

        return saved;
    }

    @Auditable(module = "BOOKING", action = "CANCEL", entityType = "Booking")
    @Transactional
    public Booking cancelBooking(Long bookingId, Long userId) {
        Booking booking = getBookingById(bookingId);

        if (!booking.getUser().getId().equals(userId)) {
            throw new BadRequestException("You can only cancel your own bookings");
        }

        if (booking.getStatus() == BookingStatus.IN_USE ||
            booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel booking that is in progress or completed");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);

        BookingHistory history = BookingHistory.builder()
                .booking(saved)
                .status(BookingStatus.CANCELLED.name())
                .remarks("Cancelled by user")
                .build();
        bookingHistoryRepository.save(Objects.requireNonNull(history));

        // Notify lab managers about cancellation
        notifyLabManagers(booking.getEquipment(), booking.getUser(), saved);

        promoteFromWaitlist(booking.getEquipment().getId());

        return saved;
    }

    @Auditable(module = "BOOKING", action = "COMPLETE", entityType = "Booking")
    @Transactional
    public Booking completeBooking(Long bookingId, Long managerId) {
        Booking booking = getBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.CONFIRMED && booking.getStatus() != BookingStatus.IN_USE && booking.getStatus() != BookingStatus.APPROVED) {
            throw new BadRequestException("Can only complete bookings that are APPROVED, CONFIRMED, or IN_USE");
        }

        User manager = userRepository.findById(Objects.requireNonNull(managerId))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        booking.setStatus(BookingStatus.COMPLETED);
        Booking saved = bookingRepository.save(booking);

        BookingHistory history = BookingHistory.builder()
                .booking(saved)
                .status(BookingStatus.COMPLETED.name())
                .remarks("Booking marked as completed")
                .updatedBy(manager)
                .build();
        bookingHistoryRepository.save(Objects.requireNonNull(history));

        Equipment equipment = booking.getEquipment();
        if (equipment != null && (equipment.getStatus() == EquipmentStatus.IN_USE || equipment.getStatus() == EquipmentStatus.RESERVED)) {
            equipment.setStatus(EquipmentStatus.AVAILABLE);
            equipmentRepository.save(equipment);
        }

        try {
            invoiceService.generateInvoiceFromBooking(bookingId);
            log.info("Auto-generated invoice for completed booking {}", bookingId);
        } catch (Exception e) {
            log.warn("Failed to auto-generate invoice for booking {}: {}", bookingId, e.getMessage());
        }

        notificationService.createNotification(
                booking.getUser(),
                "Booking Completed",
                "Your booking for " + (equipment != null ? equipment.getEquipmentName() : "equipment") +
                        " on " + booking.getBookingDate() + " has been marked as completed.",
                NotificationType.BOOKING_APPROVED,
                NotificationPriority.MEDIUM
        );

        promoteFromWaitlist(booking.getEquipment().getId());
        return saved;
    }

    @Auditable(module = "BOOKING", action = "WAITLIST", entityType = "BookingWaitlist")
    @Transactional
    public void joinWaitlist(Long equipmentId, Long userId) {
        Equipment equipment = equipmentRepository.findById(Objects.requireNonNull(equipmentId))
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found"));

        waitlistRepository.findByEquipmentIdAndUserIdAndActiveTrue(equipmentId, userId)
                .ifPresent(w -> { throw new BadRequestException("Already in waitlist"); });

        Long count = waitlistRepository.countByEquipmentIdAndActiveTrue(equipmentId);

        User user = userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        BookingWaitlist waitlist = BookingWaitlist.builder()
                .equipment(equipment)
                .user(user)
                .position((int)(count + 1))
                .active(true)
                .build();
        waitlistRepository.save(Objects.requireNonNull(waitlist));

        notificationService.createNotification(
                user,
                "Added to Waitlist",
                "You have been added to the waitlist for " + equipment.getEquipmentName() +
                        ". Position: " + (count + 1),
                NotificationType.BOOKING_CREATED,
                NotificationPriority.LOW
        );
    }

    private void promoteFromWaitlist(Long equipmentId) {
        List<BookingWaitlist> waitlisted = waitlistRepository.findByEquipmentIdAndActiveTrueOrderByPositionAsc(equipmentId);
        if (!waitlisted.isEmpty()) {
            BookingWaitlist first = waitlisted.get(0);
            first.setActive(false);
            waitlistRepository.save(first);

            // Notify promoted user
            notificationService.createNotification(
                    first.getUser(),
                    "Waitlist Promotion",
                    "You have been promoted from the waitlist for " +
                            first.getEquipment().getEquipmentName() +
                            ". Please create your booking soon.",
                    NotificationType.WAITLIST_PROMOTED,
                    NotificationPriority.HIGH
            );
        }
    }

    private void validateBookingBelongsToDepartment(Booking booking, User manager) {
        if (manager.getDepartment() == null) {
            throw new BadRequestException("No department assigned to your account");
        }
        Long departmentId = manager.getDepartment().getId();
        if (booking.getEquipment() == null
                || booking.getEquipment().getLaboratory() == null
                || booking.getEquipment().getLaboratory().getDepartment() == null
                || !booking.getEquipment().getLaboratory().getDepartment().getId().equals(departmentId)) {
            throw new BadRequestException("You can only approve/reject bookings for your department's equipment");
        }
    }

    private void notifyLabManagers(Equipment equipment, User requester, Booking booking) {
        // Find lab managers for the laboratory
        if (equipment.getLaboratory() != null && equipment.getLaboratory().getDepartment() != null) {
            Long institutionId = equipment.getLaboratory().getDepartment().getInstitution().getId();
            List<User> managers = userRepository.findByRole(com.lrplatform.model.enums.UserRole.LAB_MANAGER);
            for (User manager : managers) {
                if (manager.getInstitution() != null && manager.getInstitution().getId().equals(institutionId)) {
                    notificationService.createNotification(
                            manager,
                            "New Booking Request",
                            requester.getFullName() + " has requested to book " +
                                    equipment.getEquipmentName() + " on " + booking.getBookingDate(),
                            NotificationType.BOOKING_CREATED,
                            NotificationPriority.MEDIUM
                    );
                }
            }
        }
    }

    @Transactional(readOnly = true)
    public List<BookingWaitlistResponse> getWaitlistByEquipment(Long equipmentId) {
        List<BookingWaitlist> entries;
        if (equipmentId != null) {
            entries = waitlistRepository.findByEquipmentIdAndActiveTrueOrderByPositionAsc(equipmentId);
        } else {
            entries = waitlistRepository.findAll().stream()
                    .filter(BookingWaitlist::getActive)
                    .toList();
        }
        return entries.stream().map(w -> BookingWaitlistResponse.builder()
                .id(w.getId())
                .equipmentId(w.getEquipment() != null ? w.getEquipment().getId() : null)
                .equipmentName(w.getEquipment() != null ? w.getEquipment().getEquipmentName() : null)
                .equipmentCode(w.getEquipment() != null ? w.getEquipment().getEquipmentCode() : null)
                .userId(w.getUser() != null ? w.getUser().getId() : null)
                .userFullName(w.getUser() != null ? w.getUser().getFirstName() + " " + w.getUser().getLastName() : null)
                .userEmail(w.getUser() != null ? w.getUser().getEmail() : null)
                .userRole(w.getUser() != null && w.getUser().getRole() != null ? w.getUser().getRole().name() : null)
                .position(w.getPosition())
                .active(w.getActive())
                .createdAt(w.getCreatedAt())
                .build()).toList();
    }

    @Auditable(module = "BOOKING", action = "WAITLIST_REMOVE", entityType = "BookingWaitlist")
    @Transactional
    public void removeFromWaitlist(Long waitlistId, Long managerId) {
        BookingWaitlist entry = waitlistRepository.findById(waitlistId)
                .orElseThrow(() -> new ResourceNotFoundException("Waitlist entry not found"));
        entry.setActive(false);
        waitlistRepository.save(entry);
    }

    @Auditable(module = "BOOKING", action = "WAITLIST_PROMOTE", entityType = "BookingWaitlist")
    @Transactional
    public void promoteFromWaitlistManual(Long waitlistId, Long managerId) {
        BookingWaitlist entry = waitlistRepository.findById(waitlistId)
                .orElseThrow(() -> new ResourceNotFoundException("Waitlist entry not found"));

        entry.setActive(false);
        waitlistRepository.save(entry);

        notificationService.createNotification(
                entry.getUser(),
                "Waitlist Promotion",
                "You have been promoted from the waitlist for " +
                        entry.getEquipment().getEquipmentName() +
                        ". Please create your booking soon.",
                NotificationType.WAITLIST_PROMOTED,
                NotificationPriority.HIGH
        );
    }

    private void createRecurringBookings(Booking parent, Equipment equipment, User user) {
        String pattern = parent.getRecurrencePattern();
        LocalDate endDate = parent.getRecurrenceEndDate();
        LocalDate currentDate = parent.getBookingDate();
        int maxIterations = 52;
        int count = 0;

        while (count < maxIterations) {
            currentDate = switch (pattern) {
                case "DAILY" -> currentDate.plusDays(1);
                case "WEEKLY" -> currentDate.plusWeeks(1);
                case "BIWEEKLY" -> currentDate.plusWeeks(2);
                case "MONTHLY" -> currentDate.plusMonths(1);
                default -> currentDate.plusWeeks(1);
            };

            if (currentDate.isAfter(endDate)) break;

            List<Booking> conflicts = bookingRepository.findConflictingBookings(
                    equipment.getId(), currentDate, parent.getStartTime(), parent.getEndTime());
            if (!conflicts.isEmpty()) continue;

            Booking child = Booking.builder()
                    .equipment(equipment)
                    .user(user)
                    .bookingDate(currentDate)
                    .startTime(parent.getStartTime())
                    .endTime(parent.getEndTime())
                    .purpose(parent.getPurpose())
                    .status(BookingStatus.PENDING_APPROVAL)
                    .recurrencePattern(pattern)
                    .recurrenceEndDate(endDate)
                    .recurrenceParentId(parent.getId())
                    .build();
            bookingRepository.save(child);

            BookingHistory history = BookingHistory.builder()
                    .booking(child)
                    .status(BookingStatus.PENDING_APPROVAL.name())
                    .remarks("Recurring booking (" + pattern + ")")
                    .updatedBy(user)
                    .build();
            bookingHistoryRepository.save(history);

            count++;
        }
    }
}
