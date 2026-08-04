package com.infosys.labresourceutilizationplatform.service.impl;

import com.infosys.labresourceutilizationplatform.entity.Booking;
import com.infosys.labresourceutilizationplatform.entity.Equipment;
import com.infosys.labresourceutilizationplatform.entity.User;
import com.infosys.labresourceutilizationplatform.repository.BookingRepository;
import com.infosys.labresourceutilizationplatform.repository.EquipmentRepository;
import com.infosys.labresourceutilizationplatform.repository.UserRepository;
import com.infosys.labresourceutilizationplatform.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
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

        // Fetch existing bookings for this equipment on the same date
        List<Booking> existingBookings = bookingRepository.findByEquipmentIdAndBookingDate(
                equipment.getId(), booking.getBookingDate()
        );

        boolean hasOverlap = false;
        for (Booking existing : existingBookings) {
            // Only check active reservations
            if ("Approved".equalsIgnoreCase(existing.getStatus()) || 
                "Confirmed".equalsIgnoreCase(existing.getStatus()) || 
                "Pending Approval".equalsIgnoreCase(existing.getStatus())) {
                
                // Overlap condition: StartA < EndB and EndA > StartB
                if (booking.getStartTime().isBefore(existing.getEndTime()) && 
                    booking.getEndTime().isAfter(existing.getStartTime())) {
                    hasOverlap = true;
                    break;
                }
            }
        }

        if (hasOverlap) {
            booking.setStatus("Waitlisted");
        } else {
            booking.setStatus("Pending Approval");
        }

        return bookingRepository.save(booking);
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
            existingBooking.setDuration(durationMinutes / 60.0);
        }
        
        existingBooking.setPurpose(booking.getPurpose());
        existingBooking.setStatus(booking.getStatus());

        Booking saved = bookingRepository.save(existingBooking);
        
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
                    "Pending Approval".equalsIgnoreCase(existing.getStatus())) {
                    
                    if (b.getStartTime().isBefore(existing.getEndTime()) && 
                        b.getEndTime().isAfter(existing.getStartTime())) {
                        stillHasOverlap = true;
                        break;
                    }
                }
            }
            
            if (!stillHasOverlap) {
                b.setStatus("Pending Approval");
                bookingRepository.save(b);
            }
        }
    }
}