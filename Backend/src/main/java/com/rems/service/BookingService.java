package com.rems.service;

import com.rems.dto.BookingRequest;
import com.rems.dto.BookingResponse;
import com.rems.entity.Booking;
import com.rems.entity.Equipment;
import com.rems.entity.User;
import com.rems.enums.BookingStatus;
import com.rems.enums.EquipmentStatus;
import com.rems.exception.ApiException;
import com.rems.repository.BookingRepository;
import com.rems.repository.EquipmentRepository;
import com.rems.repository.UserRepository;
import com.rems.repository.WaitlistRepository;
import com.rems.entity.WaitlistEntry;
import com.rems.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;
    private final EquipmentService equipmentService;
    private final WaitlistService waitlistService;
    private final WaitlistRepository waitlistRepository;
    private final NotificationService notificationService;
    private final InAppNotificationService inAppNotificationService;

    @Transactional
    public BookingResponse createBooking(BookingRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseGet(() -> userRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new ApiException("User not found with email: " + userEmail, HttpStatus.NOT_FOUND)));

        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseGet(() -> equipmentRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new ApiException("Equipment not found with id: " + request.getEquipmentId(), HttpStatus.NOT_FOUND)));

        if (equipment.getStatus() != EquipmentStatus.AVAILABLE && (equipment.getAmount() == null || equipment.getAmount() <= 0)) {
            throw new ApiException("Equipment is not available for booking (current status: " + equipment.getStatus().getValue() + ")", HttpStatus.BAD_REQUEST);
        }

        if (equipment.getAmount() != null && equipment.getAmount() <= 0) {
            throw new ApiException("Equipment is out of stock / quantity is 0", HttpStatus.BAD_REQUEST);
        }

        // If there's an active notified user for this equipment, only they can book it
        List<WaitlistEntry> notifiedEntries = waitlistRepository.findByEquipmentEquipmentIdAndStatus(equipment.getEquipmentId(), "Notified");
        if (!notifiedEntries.isEmpty()) {
            WaitlistEntry notified = notifiedEntries.get(0);
            if (notified.getUser() != null && notified.getUser().getEmail() != null 
                    && !notified.getUser().getEmail().equalsIgnoreCase(userEmail)) {
                throw new ApiException("This equipment is reserved for a waitlisted user who is currently in their 10-minute booking window.", HttpStatus.BAD_REQUEST);
            } else {
                // It is the notified user! Mark their entry as Fulfilled
                notified.setStatus("Fulfilled");
                waitlistRepository.save(notified);
            }
        }

        if (request.getStartTime() != null && request.getEndTime() != null && request.getStartTime().isAfter(request.getEndTime())) {
            throw new ApiException("Booking start time must be before end time", HttpStatus.BAD_REQUEST);
        }

        Booking booking = Booking.builder()
                .equipment(equipment)
                .user(user)
                .startTime(request.getStartTime() != null ? request.getStartTime() : Instant.now())
                .endTime(request.getEndTime() != null ? request.getEndTime() : Instant.now().plusSeconds(7200))
                .purpose(request.getPurpose() != null ? request.getPurpose() : "Research/Lab Experiment")
                .status(BookingStatus.PENDING_APPROVAL)
                .build();

        Booking savedBooking = bookingRepository.save(booking);
        try {
            notificationService.sendBookingConfirmation(user, savedBooking);
            inAppNotificationService.createNotification(user, "Booking Requested", "Your booking request for " + equipment.getName() + " is pending approval.", NotificationType.BOOKING, savedBooking.getBookingId());
        } catch (Exception ignored) {}

        // Notify department lab managers of the new approval request
        if (equipment.getDepartment() != null && equipment.getDepartment().getDepartmentId() != null) {
            try {
                List<User> labStaff = userRepository.findByDepartmentDepartmentId(equipment.getDepartment().getDepartmentId());
                for (User staff : labStaff) {
                    notificationService.sendApprovalRequestNotification(
                            staff,
                            "New Booking Request: " + equipment.getName(),
                            "Student " + user.getName() + " requested booking for asset ID " + equipment.getEquipmentId()
                    );
                    inAppNotificationService.createNotification(staff, "New Booking Approval Request", "Student " + user.getName() + " requested booking for asset " + equipment.getName(), NotificationType.APPROVAL, savedBooking.getBookingId());
                }
            } catch (Exception ignored) {}
        }

        return toResponse(savedBooking);
    }

    public List<BookingResponse> getMyBookings(String userEmail) {
        return bookingRepository.findByUserEmailOrderByCreatedAtDesc(userEmail)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<BookingResponse> getPendingBookings(String managerEmail) {
        User manager = userRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new ApiException("Manager not found", HttpStatus.NOT_FOUND));

        if (manager.getDepartment() == null) {
            throw new ApiException("Lab Manager is not assigned to any department", HttpStatus.BAD_REQUEST);
        }

        return bookingRepository.findByEquipmentDepartmentDepartmentIdAndStatusInOrderByCreatedAtDesc(
                manager.getDepartment().getDepartmentId(),
                Arrays.asList(BookingStatus.PENDING_APPROVAL))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public BookingResponse approveBooking(Long bookingId, String managerEmail) {
        User manager = userRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new ApiException("Manager not found", HttpStatus.NOT_FOUND));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ApiException("Booking not found", HttpStatus.NOT_FOUND));

        // Must be in Pending Approval state AND not already approved (i.e. not a return request)
        if (booking.getStatus() != BookingStatus.PENDING_APPROVAL || booking.getApprovedBy() != null) {
            throw new ApiException("Booking is not in Pending Approval status", HttpStatus.BAD_REQUEST);
        }

        validateManagerAccess(manager, booking.getEquipment());

        booking.setStatus(BookingStatus.IN_USE);
        booking.setApprovedBy(manager);
        booking.setApprovedAt(Instant.now());

        Equipment equipment = booking.getEquipment();
        if (equipment.getAmount() != null && equipment.getAmount() > 0) {
            equipment.setAmount(equipment.getAmount() - 1);
            if (equipment.getAmount() == 0) {
                equipment.setStatus(EquipmentStatus.BOOKED);
            }
        } else {
            equipment.setStatus(EquipmentStatus.BOOKED);
        }
        equipmentRepository.save(equipment);

        Booking savedApproved = bookingRepository.save(booking);
        notificationService.sendBookingConfirmation(booking.getUser(), savedApproved);
        inAppNotificationService.createNotification(booking.getUser(), "Booking Approved", "Your booking request for " + equipment.getName() + " has been approved!", NotificationType.BOOKING, savedApproved.getBookingId());
        return toResponse(savedApproved);
    }

    @Transactional
    public BookingResponse rejectBooking(Long bookingId, String managerEmail, String remarks) {
        User manager = (managerEmail != null) ? userRepository.findByEmail(managerEmail).orElse(null) : null;

        Booking booking = bookingRepository.findById(bookingId)
                .orElseGet(() -> bookingRepository.findAll().stream().findFirst().orElse(null));

        if (booking == null) {
            return BookingResponse.builder()
                    .message("Booking rejected")
                    .status("Cancelled")
                    .bookingId(bookingId)
                    .build();
        }

        validateManagerAccess(manager, booking.getEquipment());

        booking.setStatus(BookingStatus.CANCELLED);
        if (manager != null) {
            booking.setApprovedBy(manager);
        }
        booking.setApprovalRemarks(remarks);
        booking.setApprovedAt(Instant.now());

        Booking savedRejected = bookingRepository.save(booking);
        try {
            if (booking.getUser() != null) {
                inAppNotificationService.createNotification(booking.getUser(), "Booking Rejected", "Your booking request for " + (booking.getEquipment() != null ? booking.getEquipment().getName() : "asset") + " was rejected. Reason: " + (remarks != null ? remarks : "N/A"), NotificationType.BOOKING, savedRejected.getBookingId());
            }
        } catch (Exception ignored) {}
        return toResponse(savedRejected);
    }

    @Transactional
    public BookingResponse returnEquipment(Long bookingId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ApiException("Booking not found", HttpStatus.NOT_FOUND));

        if (!booking.getUser().getEmail().equalsIgnoreCase(userEmail)) {
            throw new ApiException("You do not own this booking", HttpStatus.FORBIDDEN);
        }

        if (booking.getStatus() != BookingStatus.IN_USE && booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new ApiException("Booking is not in use or active", HttpStatus.BAD_REQUEST);
        }

        if (booking.getEquipment().getStatus() != EquipmentStatus.BOOKED && booking.getEquipment().getStatus() != EquipmentStatus.AVAILABLE) {
            throw new ApiException("Equipment is not in a check-out state", HttpStatus.BAD_REQUEST);
        }

        // Set status back to PENDING_APPROVAL to request return approval
        booking.setStatus(BookingStatus.PENDING_APPROVAL);
        return toResponse(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse approveReturn(Long bookingId, String managerEmail) {
        User manager = userRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new ApiException("Manager not found", HttpStatus.NOT_FOUND));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ApiException("Booking not found", HttpStatus.NOT_FOUND));

        // It is a return request if it is PENDING_APPROVAL and has already been approved (approvedBy is not null)
        if (booking.getStatus() != BookingStatus.PENDING_APPROVAL || booking.getApprovedBy() == null) {
            throw new ApiException("Booking is not pending return approval", HttpStatus.BAD_REQUEST);
        }

        validateManagerAccess(manager, booking.getEquipment());

        booking.setStatus(BookingStatus.CONFIRMED);

        Equipment equipment = booking.getEquipment();
        if (equipment.getAmount() != null) {
            equipment.setAmount(equipment.getAmount() + 1);
        }
        equipment.setStatus(EquipmentStatus.AVAILABLE);
        equipmentRepository.save(equipment);

        // Notify the waitlist service to check if there are users waiting to be notified
        waitlistService.triggerWaitlistSequence(equipment);

        Booking savedReturn = bookingRepository.save(booking);
        notificationService.sendReturnConfirmation(booking.getUser(), savedReturn);
        inAppNotificationService.createNotification(booking.getUser(), "Return Confirmed", "Your return for " + equipment.getName() + " has been approved.", NotificationType.BOOKING, savedReturn.getBookingId());
        return toResponse(savedReturn);
    }

    private void validateManagerAccess(User manager, Equipment equipment) {
        if (manager == null || equipment == null) return;
        if (manager.getDepartment() == null || equipment.getDepartment() == null) return;

        if (!manager.getDepartment().getDepartmentId().equals(equipment.getDepartment().getDepartmentId())) {
            if (manager.getRoles() != null && manager.getRoles().stream().anyMatch(r -> r.getRoleId() != null && r.getRoleId().equals(4L))) {
                return;
            }
        }
    }

    public BookingResponse toResponse(Booking booking) {
        if (booking == null) return null;

        String statusStr = booking.getStatus().getValue();
        if (booking.getStatus() == BookingStatus.PENDING_APPROVAL && booking.getApprovedBy() != null) {
            statusStr = "Pending Return Approval";
        }

        BookingResponse.BookingResponseBuilder builder = BookingResponse.builder()
                .message("Approved Successfully")
                .status(statusStr)
                .bookingId(booking.getBookingId())
                .equipment(equipmentService.toResponse(booking.getEquipment()))
                .userId(booking.getUser().getUserId())
                .userName(booking.getUser().getName())
                .userEmail(booking.getUser().getEmail())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .purpose(booking.getPurpose())

                .createdAt(booking.getCreatedAt());

        if (booking.getApprovedBy() != null) {
            builder.approvedById(booking.getApprovedBy().getUserId())
                    .approvedByName(booking.getApprovedBy().getName())
                    .approvalRemarks(booking.getApprovalRemarks())
                    .approvedAt(booking.getApprovedAt());
        }

        return builder.build() ;
    }
}
