package com.labresource.backend.controller;

import com.labresource.backend.entity.Booking;
import com.labresource.backend.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.labresource.backend.dto.BookingRequest;
import java.util.List;
import org.springframework.security.core.Authentication;

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
        public ResponseEntity<Booking> createBooking(
                @RequestBody BookingRequest request,
                Authentication authentication) {

            return ResponseEntity.ok(
                    bookingService.createBooking(request, authentication)
            );
        }
    // Get All Bookings
    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // Student / Faculty
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Booking>> getBookingsByUser(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                bookingService.getBookingsByUser(userId)
        );
    }

    // Lab Assistant
    @GetMapping("/today")
    public ResponseEntity<List<Booking>> getTodaysBookings() {

        return ResponseEntity.ok(
                bookingService.getTodaysBookings()
        );
    }

    // Department Head / Institute Admin
    @GetMapping("/pending")
    public ResponseEntity<List<Booking>> getPendingBookings() {

        return ResponseEntity.ok(
                bookingService.getPendingBookings()
        );
    }

    // Get Booking By ID
    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    // Update Booking
    @PutMapping("/{id}")
    public ResponseEntity<Booking> updateBooking(
        @PathVariable Long id,
        @RequestBody Booking booking) {

        return ResponseEntity.ok(
            bookingService.updateBooking(id, booking)
        );
    }

    // Delete Booking
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBooking(@PathVariable Long id) {

        bookingService.deleteBooking(id);

        return ResponseEntity.ok("Booking deleted successfully");
    }

    // Approve Booking
    @PutMapping("/{id}/approve")
    public ResponseEntity<Booking> approveBooking(@PathVariable Long id) {

        return ResponseEntity.ok(
            bookingService.approveBooking(id)
        );
    }

    // Reject Booking
    @PutMapping("/{id}/reject")
    public ResponseEntity<Booking> rejectBooking(@PathVariable Long id) {

        return ResponseEntity.ok(
            bookingService.rejectBooking(id)
        );
    }

    // Cancel Booking
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(@PathVariable Long id) {

        return ResponseEntity.ok(
            bookingService.cancelBooking(id)
        );
    }

    // Complete Booking
    @PutMapping("/{id}/complete")
    public ResponseEntity<Booking> completeBooking(@PathVariable Long id) {

        return ResponseEntity.ok(
            bookingService.completeBooking(id)
        );
    }
    @GetMapping("/count")
    public ResponseEntity<Long> countBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings().stream().count());
    }

    @GetMapping("/institution/{institutionId}")
    public ResponseEntity<List<Booking>> getBookingsByInstitution(
            @PathVariable Long institutionId) {

        return ResponseEntity.ok(
                bookingService.getBookingsByInstitution(institutionId)
        );
    }
}