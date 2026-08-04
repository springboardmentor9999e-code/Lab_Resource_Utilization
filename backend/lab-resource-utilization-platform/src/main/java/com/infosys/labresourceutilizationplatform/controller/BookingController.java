package com.infosys.labresourceutilizationplatform.controller;

import com.infosys.labresourceutilizationplatform.entity.Booking;
import com.infosys.labresourceutilizationplatform.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody Booking booking) {

        System.out.println("Booking API Hit");

        Booking savedBooking = bookingService.createBooking(booking);
        return ResponseEntity.ok(savedBooking);
    }

    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {

        Booking booking = bookingService.getBookingById(id);

        if (booking == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(booking);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Booking> updateBooking(
            @PathVariable Long id,
            @RequestBody Booking booking) {

        Booking updatedBooking =
                bookingService.updateBooking(id, booking);

        if (updatedBooking == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedBooking);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id, java.security.Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        try {
            Booking cancelled = bookingService.cancelBooking(id, principal.getName());
            return ResponseEntity.ok(cancelled);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBooking(@PathVariable Long id) {

        bookingService.deleteBooking(id);

        return ResponseEntity.ok("Booking deleted successfully.");
    }
}