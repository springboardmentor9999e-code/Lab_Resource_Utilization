package com.infosys.labresourceutilizationplatform.service.impl;

import com.infosys.labresourceutilizationplatform.entity.Booking;
import com.infosys.labresourceutilizationplatform.entity.Equipment;
import com.infosys.labresourceutilizationplatform.entity.User;
import com.infosys.labresourceutilizationplatform.repository.BookingRepository;
import com.infosys.labresourceutilizationplatform.repository.EquipmentRepository;
import com.infosys.labresourceutilizationplatform.repository.UserRepository;
import com.infosys.labresourceutilizationplatform.service.BookingService;
import com.infosys.labresourceutilizationplatform.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import com.infosys.labresourceutilizationplatform.repository.InstitutionRepository;
import com.infosys.labresourceutilizationplatform.entity.Institution;
import java.time.LocalTime;
import java.util.List;

@Service
public class BookingServiceImpl implements BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private InstitutionRepository institutionRepository;

    @Override
    public Booking createBooking(Booking booking) {

        User user = userRepository.findById(
                booking.getUser().getUserId()
        ).orElseThrow(() ->
                new RuntimeException("User not found"));

        Equipment equipment = equipmentRepository.findById(
                booking.getEquipment().getId()
        ).orElseThrow(() ->
                new RuntimeException("Equipment not found"));

        // Date & Time Validations
        if (booking.getBookingDate() == null || booking.getStartTime() == null || booking.getEndTime() == null) {
            throw new RuntimeException("Booking Date, Start Time, and End Time are required.");
        }

        java.time.LocalDateTime now = java.time.LocalDateTime.now(java.time.ZoneId.systemDefault());
        java.time.LocalDateTime bookingStart = java.time.LocalDateTime.of(booking.getBookingDate(), booking.getStartTime());
        java.time.LocalDateTime bookingEnd = java.time.LocalDateTime.of(booking.getBookingDate(), booking.getEndTime());

        if (bookingStart.isBefore(now)) {
            if (booking.getBookingDate().isBefore(now.toLocalDate())) {
                throw new RuntimeException("Bookings cannot be created for past dates or times.");
            } else {
                throw new RuntimeException("Start time must be after the current time.");
            }
        }

        if (!bookingEnd.isAfter(bookingStart)) {
            throw new RuntimeException("End time must be later than the start time.");
        }

        // Calculate and set duration automatically (in hours)
        double durationMinutes = java.time.Duration.between(bookingStart, bookingEnd).toMinutes();
        if (durationMinutes <= 0) {
            throw new RuntimeException("Booking duration must be greater than zero.");
        }
        booking.setDuration(durationMinutes / 60.0);

        booking.setUser(user);
        booking.setEquipment(equipment);

        // Determine if inter-institute
        Long eqInstId = equipment.getLaboratory().getDepartment().getInstitution().getInstitutionId();
        Integer userInstId = user.getInstitutionId();
        boolean isInterInstitute = userInstId == null || !eqInstId.equals(Long.valueOf(userInstId));

        // Fetch existing bookings for this equipment on the same date
        List<Booking> existingBookings = bookingRepository.findByEquipmentIdAndBookingDate(
                equipment.getId(), booking.getBookingDate()
        );

        boolean hasOverlap = false;
        for (Booking existing : existingBookings) {
            // Only check active reservations
            if ("Approved".equalsIgnoreCase(existing.getStatus()) || 
                "Confirmed".equalsIgnoreCase(existing.getStatus()) || 
                "Pending Approval".equalsIgnoreCase(existing.getStatus()) ||
                "Pending".equalsIgnoreCase(existing.getStatus()) ||
                "Active".equalsIgnoreCase(existing.getStatus()) ||
                "In Use".equalsIgnoreCase(existing.getStatus())) {
                
                // Overlap condition: StartA < EndB and EndA > StartB
                if (booking.getStartTime().isBefore(existing.getEndTime()) && 
                    booking.getEndTime().isAfter(existing.getStartTime())) {
                    hasOverlap = true;
                    break;
                }
            }
        }

        if (isInterInstitute) {
            double costPerHour = equipment.getCostPerHour() != null ? equipment.getCostPerHour() : 0.0;
            booking.setUtilizationCost(booking.getDuration() * costPerHour);
            booking.setStatus("Pending");
        } else {
            booking.setUtilizationCost(0.0);
            if (hasOverlap) {
                booking.setStatus("Waitlisted");
            } else {
                booking.setStatus("Pending Approval");
            }
        }

        Booking saved = bookingRepository.save(booking);

        Long instId = (saved.getEquipment() != null && saved.getEquipment().getLaboratory() != null &&
                       saved.getEquipment().getLaboratory().getDepartment() != null &&
                       saved.getEquipment().getLaboratory().getDepartment().getInstitution() != null) ?
                       saved.getEquipment().getLaboratory().getDepartment().getInstitution().getInstitutionId() : null;

        String userName = saved.getUser() != null ? saved.getUser().getFullName() : "A user";
        String eqName = saved.getEquipment() != null ? saved.getEquipment().getEquipmentName() : "Equipment";
        String msg = "New booking request received from " + userName + " for " + eqName + ".";

        // Generate notifications for only the roles responsible for approval
        notificationService.sendNotification(null, "INSTITUTION_ADMIN", instId, "Booking Request", msg, "BOOKING", "Medium");
        notificationService.sendNotification(null, "SYSTEM_ADMIN", null, "Booking Request", msg, "BOOKING", "Medium");
        notificationService.sendNotification(null, "LAB_MANAGER", instId, "Booking Request", msg, "BOOKING", "Medium");

        if (isInterInstitute) {
            String userInstName = "External Institute";
            if (user.getInstitutionId() != null) {
                userInstName = institutionRepository.findById(Long.valueOf(user.getInstitutionId()))
                        .map(Institution::getInstitutionName)
                        .orElse("External Institute");
            }
            String eqInstName = (saved.getEquipment() != null && saved.getEquipment().getLaboratory() != null &&
                                 saved.getEquipment().getLaboratory().getDepartment() != null &&
                                 saved.getEquipment().getLaboratory().getDepartment().getInstitution() != null) ?
                                 saved.getEquipment().getLaboratory().getDepartment().getInstitution().getInstitutionName() : "Equipment Institute";
            
            String sharingMsg = "New inter-institute resource sharing request received from " + user.getFullName() + " (" + userInstName + ") for " + eqName + " (" + eqInstName + ").";
            notificationService.sendNotification(null, "SYSTEM_ADMIN", null, "Resource Sharing Request", sharingMsg, "SYSTEM", "High");
            notificationService.sendNotification(null, "INSTITUTION_ADMIN", instId, "Resource Sharing Request", sharingMsg, "SYSTEM", "High");
        }

        return saved;
    }

    @Override
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @Override
    public Booking getBookingById(Long bookingId) {
        return bookingRepository.findById(bookingId).orElse(null);
    }

    @Override
    public Booking updateBooking(Long bookingId, Booking booking) {

        Booking existingBooking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new RuntimeException("Booking not found"));

        User user = userRepository.findById(
                booking.getUser().getUserId()
        ).orElseThrow(() ->
                new RuntimeException("User not found"));

        Equipment equipment = equipmentRepository.findById(
                booking.getEquipment().getId()
        ).orElseThrow(() ->
                new RuntimeException("Equipment not found"));

        existingBooking.setUser(user);
        existingBooking.setEquipment(equipment);
        existingBooking.setBookingDate(booking.getBookingDate());
        existingBooking.setStartTime(booking.getStartTime());
        existingBooking.setEndTime(booking.getEndTime());
        
        if (booking.getStartTime() != null && booking.getEndTime() != null) {
            double durationMinutes = java.time.Duration.between(booking.getStartTime(), booking.getEndTime()).toMinutes();
            double durationHrs = durationMinutes / 60.0;
            existingBooking.setDuration(durationHrs);

            // Recalculate cost
            Long eqInstId = equipment.getLaboratory().getDepartment().getInstitution().getInstitutionId();
            Integer userInstId = user.getInstitutionId();
            if (userInstId == null || !eqInstId.equals(Long.valueOf(userInstId))) {
                double costPerHour = equipment.getCostPerHour() != null ? equipment.getCostPerHour() : 0.0;
                existingBooking.setUtilizationCost(durationHrs * costPerHour);
            } else {
                existingBooking.setUtilizationCost(0.0);
            }
        }
        
        existingBooking.setPurpose(booking.getPurpose());
        
        if ("Approved".equalsIgnoreCase(booking.getStatus()) || "Confirmed".equalsIgnoreCase(booking.getStatus())) {
            java.time.LocalDateTime now = java.time.LocalDateTime.now(java.time.ZoneId.systemDefault());
            java.time.LocalDateTime bookingStart = java.time.LocalDateTime.of(existingBooking.getBookingDate(), existingBooking.getStartTime());
            if (bookingStart.isBefore(now)) {
                existingBooking.setStatus("Expired");
                bookingRepository.save(existingBooking);
                throw new RuntimeException("This booking request has expired because the requested booking time has already passed.");
            }
        }
        
        String oldStatus = existingBooking.getStatus();
        String newStatus = booking.getStatus();
        existingBooking.setStatus(newStatus);

        Booking saved = bookingRepository.save(existingBooking);
        
        if (!newStatus.equalsIgnoreCase(oldStatus)) {
            Long userId = (saved.getUser() != null && saved.getUser().getUserId() != null) ? Long.valueOf(saved.getUser().getUserId()) : null;
            Long instId = (saved.getEquipment() != null && saved.getEquipment().getLaboratory() != null &&
                           saved.getEquipment().getLaboratory().getDepartment() != null &&
                           saved.getEquipment().getLaboratory().getDepartment().getInstitution() != null) ?
                           saved.getEquipment().getLaboratory().getDepartment().getInstitution().getInstitutionId() : null;
            String equipName = saved.getEquipment() != null ? saved.getEquipment().getEquipmentName() : "Equipment";

            if ("Approved".equalsIgnoreCase(newStatus) || "Confirmed".equalsIgnoreCase(newStatus) || "Booked".equalsIgnoreCase(newStatus)) {
                notificationService.sendNotification(userId, null, instId, "Booking Approved", "Your booking request for " + equipName + " on " + saved.getBookingDate() + " has been approved.", "BOOKING");
            } else if ("Rejected".equalsIgnoreCase(newStatus)) {
                notificationService.sendNotification(userId, null, instId, "Booking Rejected", "Your booking request for " + equipName + " on " + saved.getBookingDate() + " has been rejected.", "BOOKING");
            } else if ("Cancelled".equalsIgnoreCase(newStatus)) {
                notificationService.sendNotification(userId, null, instId, "Booking Cancelled", "Your booking request for " + equipName + " on " + saved.getBookingDate() + " has been cancelled.", "BOOKING");
            } else if ("Completed".equalsIgnoreCase(newStatus)) {
                notificationService.sendNotification(userId, null, instId, "Booking Completed", "Your booking request for " + equipName + " on " + saved.getBookingDate() + " has been completed.", "BOOKING");
            } else if ("Expired".equalsIgnoreCase(newStatus)) {
                notificationService.sendNotification(userId, null, instId, "Booking Expired", "Your booking request for " + equipName + " on " + saved.getBookingDate() + " has expired.", "BOOKING");
            }
        }

        // Promote waitlisted bookings if status changed to Rejected/Cancelled
        if ("Rejected".equalsIgnoreCase(booking.getStatus()) || "Cancelled".equalsIgnoreCase(booking.getStatus())) {
            promoteWaitlistedBookings();
        }
        
        return saved;
    }

    @Override
    public void deleteBooking(Long bookingId) {
        bookingRepository.deleteById(bookingId);
        promoteWaitlistedBookings();
    }

    @Override
    public Booking cancelBooking(Long bookingId, String email) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        User requestingUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Requesting user not found"));

        boolean isOwner = booking.getUser() != null && booking.getUser().getUserId().equals(requestingUser.getUserId());
        boolean isAuthority = false;
        if (requestingUser.getRole() != null) {
            String roleName = requestingUser.getRole().getRoleName();
            isAuthority = "LAB_MANAGER".equalsIgnoreCase(roleName)
                    || "LAB_TECHNICIAN".equalsIgnoreCase(roleName)
                    || "INSTITUTION_ADMIN".equalsIgnoreCase(roleName)
                    || "SYSTEM_ADMIN".equalsIgnoreCase(roleName)
                    || "DEPARTMENT_HEAD".equalsIgnoreCase(roleName);
        }

        if (!isOwner && !isAuthority) {
            throw new RuntimeException("Unauthorized to cancel this booking");
        }

        booking.setStatus("Cancelled");
        Booking saved = bookingRepository.save(booking);

        Long userId = (saved.getUser() != null && saved.getUser().getUserId() != null) ? Long.valueOf(saved.getUser().getUserId()) : null;
        Long instId = (saved.getEquipment() != null && saved.getEquipment().getLaboratory() != null &&
                       saved.getEquipment().getLaboratory().getDepartment() != null &&
                       saved.getEquipment().getLaboratory().getDepartment().getInstitution() != null) ?
                       saved.getEquipment().getLaboratory().getDepartment().getInstitution().getInstitutionId() : null;
        String equipName = saved.getEquipment() != null ? saved.getEquipment().getEquipmentName() : "Equipment";
        
        notificationService.sendNotification(userId, null, instId, "Booking Cancelled", "Your booking for " + equipName + " on " + saved.getBookingDate() + " has been cancelled.", "BOOKING");

        promoteWaitlistedBookings();

        return saved;
    }

    private void promoteWaitlistedBookings() {
        List<Booking> allWaitlisted = bookingRepository.findByStatus("Waitlisted");
        for (Booking b : allWaitlisted) {
            List<Booking> sameDayBookings = bookingRepository.findByEquipmentIdAndBookingDate(
                    b.getEquipment().getId(), b.getBookingDate()
            );
            
            boolean stillHasOverlap = false;
            for (Booking existing : sameDayBookings) {
                if (existing.getBookingId().equals(b.getBookingId())) {
                    continue;
                }
                
                if ("Approved".equalsIgnoreCase(existing.getStatus()) || 
                    "Pending Approval".equalsIgnoreCase(existing.getStatus()) ||
                    "Pending".equalsIgnoreCase(existing.getStatus()) ||
                    "Active".equalsIgnoreCase(existing.getStatus()) ||
                    "In Use".equalsIgnoreCase(existing.getStatus()) ||
                    "Confirmed".equalsIgnoreCase(existing.getStatus())) {
                    
                    if (b.getStartTime().isBefore(existing.getEndTime()) && 
                        b.getEndTime().isAfter(existing.getStartTime())) {
                        stillHasOverlap = true;
                        break;
                    }
                }
            }
            
            if (!stillHasOverlap) {
                // For inter-institute bookings promote to Pending, for internal promote to Pending Approval
                Long eqInstId = b.getEquipment().getLaboratory().getDepartment().getInstitution().getInstitutionId();
                Integer userInstId = b.getUser().getInstitutionId();
                if (userInstId == null || !eqInstId.equals(Long.valueOf(userInstId))) {
                    b.setStatus("Pending");
                } else {
                    b.setStatus("Pending Approval");
                }
                bookingRepository.save(b);
            }
        }
    }
}