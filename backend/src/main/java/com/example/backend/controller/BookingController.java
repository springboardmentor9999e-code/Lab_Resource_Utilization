package com.example.backend.controller;

import com.example.backend.entity.Booking;
import com.example.backend.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<Booking> saveBooking(@RequestBody Booking booking) {
        return ResponseEntity.ok(bookingService.saveBooking(booking));
    }

    // Get All Bookings
    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // Get Booking By ID
    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {

        Booking booking = bookingService.getBookingById(id);

        if (booking == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(booking);
    }

    // Update Booking
    @PutMapping("/{id}")
    public ResponseEntity<Booking> updateBooking(
            @PathVariable Long id,
            @RequestBody Booking booking) {

        booking.setId(id);

        Booking updatedBooking = bookingService.updateBooking(booking);

        if (updatedBooking == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedBooking);
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

        Booking booking = bookingService.approveBooking(id);

        if (booking == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(booking);
    }

    // Cancel Booking
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(@PathVariable Long id) {

        Booking booking = bookingService.cancelBooking(id);

        if (booking == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(booking);
    }

    // Return Equipment
    @PutMapping("/{id}/return")
    public ResponseEntity<Booking> returnEquipment(@PathVariable Long id) {

        Booking booking = bookingService.returnEquipment(id);

        if (booking == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(booking);
    }
}