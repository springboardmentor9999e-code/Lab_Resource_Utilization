package com.labhub.service.impl;

import com.labhub.dto.booking.BookingRequest;
import com.labhub.dto.booking.BookingResponse;
import com.labhub.entity.Booking;
import com.labhub.entity.BookingApproval;
import com.labhub.entity.Equipment;
import com.labhub.entity.User;
import com.labhub.entity.Role;
import com.labhub.enums.ApprovalDecision;
import com.labhub.enums.BookingStatus;
import com.labhub.enums.EquipmentStatus;
import com.labhub.enums.RoleName;
import com.labhub.enums.NotificationType;
import com.labhub.exception.BookingConflictException;
import com.labhub.exception.ResourceNotFoundException;
import com.labhub.exception.UnauthorizedException;
import com.labhub.repository.BookingApprovalRepository;
import com.labhub.repository.BookingRepository;
import com.labhub.repository.EquipmentRepository;
import com.labhub.repository.UserRepository;
import com.labhub.service.BookingService;
import com.labhub.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Booking service implementation with conflict detection and approval workflow.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final BookingApprovalRepository bookingApprovalRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public BookingResponse create(BookingRequest request, String userEmail) {
        // Validate time range
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }
        if (request.getStartTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Start time cannot be in the past");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment", "id", request.getEquipmentId()));

        // Validate equipment status
        if (equipment.getStatus() == EquipmentStatus.UNDER_MAINTENANCE) {
            throw new IllegalArgumentException("Equipment is under maintenance and cannot be booked");
        }
        if (equipment.getStatus() == EquipmentStatus.RETIRED) {
            throw new IllegalArgumentException("Equipment is retired and cannot be booked");
        }
        if (equipment.getStatus() == EquipmentStatus.OUT_OF_SERVICE) {
            throw new IllegalArgumentException("Equipment is out of service and cannot be booked");
        }

        // Check for booking conflicts
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                equipment.getId(), request.getStartTime(), request.getEndTime());
        if (!conflicts.isEmpty()) {
            throw new BookingConflictException(
                    "Equipment is already booked during the requested time period. "
                    + "Conflicting booking: " + conflicts.get(0).getBookingReference());
        }

        // Generate booking reference
        String ref = "BK-" + System.currentTimeMillis();

        Booking booking = Booking.builder()
                .bookingReference(ref)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose())
                .notes(request.getNotes())
                .status(BookingStatus.PENDING)
                .user(user)
                .equipment(equipment)
                .isActive(true)
                .build();

        booking = bookingRepository.save(booking);
        log.info("Created booking {} for equipment {}", ref, equipment.getName());
        return toResponse(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getById(UUID id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
        return toResponse(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookingResponse> getAll(BookingStatus status, UUID userId, Pageable pageable) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            String email = auth.getName();
            User currentUser = userRepository.findByEmail(email).orElse(null);
            if (currentUser != null) {
                boolean isSysAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName() == RoleName.SYSTEM_ADMIN);
                boolean isInstAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName() == RoleName.INSTITUTION_ADMIN);
                boolean isLabManager = currentUser.getRoles().stream().anyMatch(r -> r.getName() == RoleName.LAB_MANAGER);

                if (isSysAdmin) {
                    return bookingRepository.findWithFilters(status, userId, pageable).map(this::toResponse);
                }

                UUID instId = (currentUser.getDepartment() != null && currentUser.getDepartment().getInstitution() != null)
                        ? currentUser.getDepartment().getInstitution().getId()
                        : (currentUser.getInstitution() != null ? currentUser.getInstitution().getId() : null);

                if (isInstAdmin || isLabManager) {
                    return bookingRepository.findWithInstitutionFilters(status, userId, instId, pageable).map(this::toResponse);
                }

                boolean isLabTech = currentUser.getRoles().stream().anyMatch(r -> r.getName() == RoleName.LAB_TECHNICIAN);

                if (isLabTech) {
                    return bookingRepository.findWithInstitutionFilters(status, userId, instId, pageable).map(this::toResponse);
                }

                // Default Researcher / other role: can only see their own bookings
                return bookingRepository.findWithFilters(status, currentUser.getId(), pageable).map(this::toResponse);
            }
        }

        return bookingRepository.findWithFilters(status, userId, pageable).map(this::toResponse);
    }

    @Override
    @Transactional
    public BookingResponse cancel(UUID id, String userEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

        // Only owner, management roles (within dept/inst), or System Admin can cancel
        if (!booking.getUser().getEmail().equals(userEmail)) {
            validateManagementAccess(booking, userEmail, "cancel");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED || booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.REJECTED) {
            throw new IllegalArgumentException("Cannot cancel a booking that is already " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CANCELLED);

        // Reset equipment status to AVAILABLE if it was BOOKED by this booking
        if (booking.getEquipment().getStatus() == EquipmentStatus.BOOKED) {
            Equipment equipment = booking.getEquipment();
            equipment.setStatus(EquipmentStatus.AVAILABLE);
            equipmentRepository.save(equipment);
        }

        booking = bookingRepository.save(booking);
        log.info("Cancelled booking: {}", booking.getBookingReference());
        return toResponse(booking);
    }

    @Override
    @Transactional
    public BookingResponse approve(UUID id, String approverEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

        User approver = userRepository.findByEmail(approverEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", approverEmail));

        boolean isSystemAdmin = approver.getRoles().stream().anyMatch(r -> r.getName() == RoleName.SYSTEM_ADMIN);
        boolean isInstAdmin = approver.getRoles().stream().anyMatch(r -> r.getName() == RoleName.INSTITUTION_ADMIN);
        boolean isLabManager = approver.getRoles().stream().anyMatch(r -> r.getName() == RoleName.LAB_MANAGER);
        boolean isLabTech = approver.getRoles().stream().anyMatch(r -> r.getName() == RoleName.LAB_TECHNICIAN);
        boolean isAdmin = isSystemAdmin || isInstAdmin || isLabManager || isLabTech;

        // Non-admins can only approve PENDING bookings
        if (!isAdmin && booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only PENDING bookings can be approved");
        }

        validateManagementAccess(booking, approverEmail, "approve");

        booking.setStatus(BookingStatus.CONFIRMED);
        
        // After approval, the equipment becomes booked
        Equipment equipment = booking.getEquipment();
        equipment.setStatus(EquipmentStatus.BOOKED);
        equipmentRepository.save(equipment);

        booking = bookingRepository.save(booking);

        BookingApproval approval = BookingApproval.builder()
                .booking(booking)
                .approver(approver)
                .decision(ApprovalDecision.APPROVED)
                .isActive(true)
                .build();
        bookingApprovalRepository.save(approval);

        // Send confirmation notification
        notificationService.createNotification(
                booking.getUser(),
                "Booking Request Approved",
                "Your booking request for equipment " + booking.getEquipment().getName() + " has been approved.",
                NotificationType.BOOKING_CONFIRMED,
                "/bookings"
        );

        log.info("Approved booking: {}", booking.getBookingReference());
        return toResponse(booking);
    }

    @Override
    @Transactional
    public BookingResponse reject(UUID id, String approverEmail, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

        User approver = userRepository.findByEmail(approverEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", approverEmail));

        boolean isSystemAdmin = approver.getRoles().stream().anyMatch(r -> r.getName() == RoleName.SYSTEM_ADMIN);
        boolean isInstAdmin = approver.getRoles().stream().anyMatch(r -> r.getName() == RoleName.INSTITUTION_ADMIN);
        boolean isLabManager = approver.getRoles().stream().anyMatch(r -> r.getName() == RoleName.LAB_MANAGER);
        boolean isLabTech = approver.getRoles().stream().anyMatch(r -> r.getName() == RoleName.LAB_TECHNICIAN);
        boolean isAdmin = isSystemAdmin || isInstAdmin || isLabManager || isLabTech;

        // Non-admins can only reject PENDING bookings
        if (!isAdmin && booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only PENDING bookings can be rejected");
        }

        validateManagementAccess(booking, approverEmail, "reject");

        booking.setStatus(BookingStatus.CANCELLED);
        booking = bookingRepository.save(booking);

        BookingApproval approval = BookingApproval.builder()
                .booking(booking)
                .approver(approver)
                .decision(ApprovalDecision.REJECTED)
                .comments(reason)
                .isActive(true)
                .build();
        bookingApprovalRepository.save(approval);

        // Send rejection notification
        notificationService.createNotification(
                booking.getUser(),
                "Booking Request Rejected",
                "Your booking request for equipment " + booking.getEquipment().getName() + " was rejected. Reason: " + (reason != null ? reason : "N/A"),
                NotificationType.BOOKING_CANCELLED,
                "/bookings"
        );

        log.info("Rejected booking: {}", booking.getBookingReference());
        return toResponse(booking);
    }

    @Override
    @Transactional
    public BookingResponse markInUse(UUID id, String userEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new IllegalArgumentException("Only CONFIRMED bookings can be marked as IN_USE");
        }

        validateManagementAccess(booking, userEmail, "mark as IN_USE");

        booking.setStatus(BookingStatus.IN_USE);
        Equipment equipment = booking.getEquipment();
        equipment.setStatus(EquipmentStatus.BOOKED);
        equipmentRepository.save(equipment);

        booking = bookingRepository.save(booking);
        log.info("Marked booking {} as IN_USE", booking.getBookingReference());
        return toResponse(booking);
    }

    @Override
    @Transactional
    public BookingResponse markReturned(UUID id, String userEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

        booking.setStatus(BookingStatus.COMPLETED);
        Equipment equipment = booking.getEquipment();
        equipment.setStatus(EquipmentStatus.AVAILABLE);
        equipmentRepository.save(equipment);

        booking = bookingRepository.save(booking);
        log.info("Marked booking {} as COMPLETED (returned)", booking.getBookingReference());
        return toResponse(booking);
    }

    @Override
    @Transactional
    public BookingResponse markComplete(UUID id, String userEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

        booking.setStatus(BookingStatus.COMPLETED);
        Equipment equipment = booking.getEquipment();
        if (equipment.getStatus() == EquipmentStatus.BOOKED) {
            equipment.setStatus(EquipmentStatus.AVAILABLE);
            equipmentRepository.save(equipment);
        }

        booking = bookingRepository.save(booking);
        log.info("Marked booking {} as COMPLETED", booking.getBookingReference());
        return toResponse(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getRecentBookings(int limit) {
        return bookingRepository.findTop5ByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(String userEmail, int limit) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));
        return bookingRepository.findByUserId(user.getId(), org.springframework.data.domain.PageRequest.of(0, limit, org.springframework.data.domain.Sort.by("createdAt").descending()))
                .getContent()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> suggestNextAvailableSlots(UUID equipmentId, String dateStr) {
        java.time.LocalDate date = (dateStr != null && !dateStr.isBlank()) ? java.time.LocalDate.parse(dateStr) : java.time.LocalDate.now();
        List<String> suggested = new java.util.ArrayList<>();
        
        // Check hourly slots from 09:00 to 17:00
        for (int hour = 9; hour < 17; hour++) {
            LocalDateTime start = date.atTime(hour, 0);
            LocalDateTime end = date.atTime(hour + 2, 0);
            List<Booking> conflicts = bookingRepository.findConflictingBookings(equipmentId, start, end);
            if (conflicts.isEmpty()) {
                suggested.add(String.format("%02d:00 - %02d:00", hour, hour + 2));
            }
        }
        if (suggested.isEmpty()) {
            // Suggest tomorrow slots
            java.time.LocalDate tomorrow = date.plusDays(1);
            suggested.add(tomorrow + " 09:00 - 11:00");
            suggested.add(tomorrow + " 11:00 - 13:00");
            suggested.add(tomorrow + " 14:00 - 16:00");
        }
        return suggested;
    }

    private void validateManagementAccess(Booking booking, String userEmail, String action) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        boolean isSystemAdmin = user.getRoles().stream().anyMatch(r -> r.getName() == RoleName.SYSTEM_ADMIN);
        if (isSystemAdmin) {
            return;
        }

        UUID userDeptId = user.getDepartment() != null ? user.getDepartment().getId() : null;
        UUID bookingDeptId = (booking.getEquipment() != null && booking.getEquipment().getDepartment() != null)
                ? booking.getEquipment().getDepartment().getId() : null;

        UUID userInstId = user.getInstitution() != null ? user.getInstitution().getId() :
                ((user.getDepartment() != null && user.getDepartment().getInstitution() != null) 
                ? user.getDepartment().getInstitution().getId() : null);
        UUID bookingInstId = (booking.getEquipment() != null && booking.getEquipment().getDepartment() != null 
                && booking.getEquipment().getDepartment().getInstitution() != null) 
                ? booking.getEquipment().getDepartment().getInstitution().getId() : null;

        for (Role role : user.getRoles()) {
            if (role.getName() == RoleName.INSTITUTION_ADMIN || role.getName() == RoleName.LAB_MANAGER
                    || role.getName() == RoleName.LAB_TECHNICIAN) {
                if (userInstId != null && userInstId.equals(bookingInstId)) {
                    return;
                }
            }
        }

        throw new UnauthorizedException("You are not authorized to " + action + " for this department's equipment");
    }

    public BookingResponse toResponse(Booking b) {
        return BookingResponse.builder()
                .id(b.getId())
                .bookingReference(b.getBookingReference())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .purpose(b.getPurpose())
                .notes(b.getNotes())
                .status(b.getStatus())
                .userId(b.getUser() != null ? b.getUser().getId() : null)
                .userName(b.getUser() != null ? b.getUser().getFullName() : null)
                .userEmail(b.getUser() != null ? b.getUser().getEmail() : null)
                .equipmentId(b.getEquipment() != null ? b.getEquipment().getId() : null)
                .equipmentName(b.getEquipment() != null ? b.getEquipment().getName() : null)
                .equipmentLocation(b.getEquipment() != null ? b.getEquipment().getLocation() : null)
                .categoryName(b.getEquipment() != null && b.getEquipment().getCategory() != null
                        ? b.getEquipment().getCategory().getName() : null)
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .build();
    }
}

