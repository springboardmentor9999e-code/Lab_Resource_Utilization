package com.project.Lab.Resource.Utilization.Platform.controller;

import com.project.Lab.Resource.Utilization.Platform.entity.Booking;
import com.project.Lab.Resource.Utilization.Platform.entity.User;
import com.project.Lab.Resource.Utilization.Platform.repository.BookingRepository;
import com.project.Lab.Resource.Utilization.Platform.repository.UserRepository;
import com.project.Lab.Resource.Utilization.Platform.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    // =========================================================
    // CREATE BOOKING
    // Student & Researcher Only
    // =========================================================
    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT','RESEARCHER')")
    public Booking createBooking(
            @RequestBody Booking booking,
            Authentication authentication
    ) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        booking.setUserId(user.getUserId());

        return bookingService.createBooking(booking);
    }

    // =========================================================
    // MY BOOKINGS
    // Student & Researcher
    // =========================================================
    @GetMapping("/my-bookings")
    @PreAuthorize("hasAnyRole('STUDENT','RESEARCHER')")
    public List<Booking> getMyBookings(Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return bookingRepository.findByUserId(user.getUserId());
    }

    // =========================================================
    // ALL BOOKINGS
    // Management Roles
    // =========================================================
    @GetMapping
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN','LAB_MANAGER','DEPARTMENT_HEAD','INSTITUTION_ADMIN','SYSTEM_ADMIN')")
    public List<Booking> getAllBookings() {

        return bookingService.getAllBookings();
    }

    // =========================================================
    // BOOKING DETAILS
    // All Logged-in Users
    // =========================================================
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public Booking getBookingById(@PathVariable Integer id) {

        return bookingService.getBookingById(id);
    }

    // =========================================================
    // BOOKINGS BY STATUS
    // =========================================================
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN','LAB_MANAGER','DEPARTMENT_HEAD','INSTITUTION_ADMIN','SYSTEM_ADMIN')")
    public List<Booking> getBookingsByStatus(
            @PathVariable String status
    ) {

        return bookingService.getBookingsByStatus(status);
    }

    // =========================================================
    // CANCEL BOOKING
    // =========================================================
    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('STUDENT','RESEARCHER')")
    public Booking cancelBooking(
            @PathVariable Integer id,
            Authentication authentication
    ) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingService.getBookingById(id);

        if (!booking.getUserId().equals(user.getUserId())) {
            throw new RuntimeException("You cannot cancel another user's booking.");
        }

        return bookingService.cancelBooking(id);
    }

    // =========================================================
    // APPROVE
    // =========================================================
//    @PutMapping("/{id}/approve")
//    @PreAuthorize("hasAnyRole('LAB_MANAGER','DEPARTMENT_HEAD','INSTITUTION_ADMIN','SYSTEM_ADMIN')")
//    public Booking approveBooking(@PathVariable Integer id) {
//
//        return bookingService.approveBooking(id);
//    }
    @PutMapping("/{id}/approve")
    @PreAuthorize("isAuthenticated()")
    public Booking approveBooking(
            @PathVariable Integer id,
            Authentication authentication
    ) {

        System.out.println("Authorities: " + authentication.getAuthorities());

        return bookingService.approveBooking(id);
    }

    // =========================================================
    // REJECT
    // =========================================================
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('LAB_MANAGER','DEPARTMENT_HEAD','INSTITUTION_ADMIN','SYSTEM_ADMIN')")
    public Booking rejectBooking(@PathVariable Integer id) {

        return bookingService.rejectBooking(id);
    }

    // =========================================================
    // MARK IN USE
    // =========================================================
    @PutMapping("/{id}/in-use")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN','LAB_MANAGER','SYSTEM_ADMIN')")
    public Booking markInUse(@PathVariable Integer id) {

        return bookingService.markInUse(id);
    }

    // =========================================================
    // COMPLETE
    // =========================================================
    @PutMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN','LAB_MANAGER','SYSTEM_ADMIN')")
    public Booking markCompleted(@PathVariable Integer id) {

        return bookingService.markCompleted(id);
    }

    // =========================================================
    // NO SHOW
    // =========================================================
    @PutMapping("/{id}/no-show")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN','LAB_MANAGER','SYSTEM_ADMIN')")
    public Booking markNoShow(@PathVariable Integer id) {

        return bookingService.markNoShow(id);
    }

}