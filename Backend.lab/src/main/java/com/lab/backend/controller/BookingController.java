package com.lab.backend.controller;

import com.lab.backend.entity.Booking;
import com.lab.backend.enums.BookingStatus;
import com.lab.backend.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // Create Booking
    @PostMapping
    public ResponseEntity<Booking> createBooking(@Valid @RequestBody Booking booking) {
        return ResponseEntity.ok(bookingService.createBooking(booking));
    }

    // Get All Bookings with Optional Search & Filters
    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long equipmentId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate bookingDate,
            @RequestParam(required = false) BookingStatus status) {

        if (userId != null || equipmentId != null || bookingDate != null || status != null) {
            return ResponseEntity.ok(bookingService.searchAndFilterBookings(userId, equipmentId, bookingDate, status));
        }

        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // Get Booking By ID
    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    // Approve Booking
    @PutMapping("/{id}/approve")
    public ResponseEntity<Booking> approveBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.approveBooking(id));
    }

    // Reject Booking
    @PutMapping("/{id}/reject")
    public ResponseEntity<Booking> rejectBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.rejectBooking(id));
    }

    // Issue Equipment
    @PutMapping("/{id}/issue")
    public ResponseEntity<Booking> issueEquipment(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.issueEquipment(id));
    }

    // Return Equipment
    @PutMapping("/{bookingId}/return")
    public ResponseEntity<?> returnEquipment(@PathVariable Long bookingId) {
        bookingService.returnEquipment(bookingId);
        return ResponseEntity.ok("Equipment returned successfully");
    }

    // Cancel Booking
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id));
    }
}