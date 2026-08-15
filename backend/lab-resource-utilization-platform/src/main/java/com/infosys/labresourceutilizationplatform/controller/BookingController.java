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
    public ResponseEntity<?> createBooking(@RequestBody Booking booking) {
        try {
            System.out.println("Booking API Hit");
            Booking savedBooking = bookingService.createBooking(booking);
            return ResponseEntity.ok(savedBooking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
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
    public ResponseEntity<?> updateBooking(
            @PathVariable Long id,
            @RequestBody Booking booking) {
        try {
            Booking updatedBooking =
                    bookingService.updateBooking(id, booking);

            if (updatedBooking == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(updatedBooking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
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

    @GetMapping("/sharing-history")
    public ResponseEntity<List<Booking>> getSharingHistory(java.security.Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        
        List<Booking> allBookings = bookingService.getAllBookings();
        List<Booking> sharingHistory = allBookings.stream()
                .filter(b -> {
                    if (b.getUser() == null || b.getEquipment() == null) return false;
                    if (b.getEquipment().getLaboratory() == null ||
                        b.getEquipment().getLaboratory().getDepartment() == null ||
                        b.getEquipment().getLaboratory().getDepartment().getInstitution() == null) return false;
                    Long eqInstId = b.getEquipment().getLaboratory().getDepartment().getInstitution().getInstitutionId();
                    Integer userInstId = b.getUser().getInstitutionId();
                    return userInstId == null || !eqInstId.equals(Long.valueOf(userInstId));
                })
                .collect(java.util.stream.Collectors.toList());
                
        return ResponseEntity.ok(sharingHistory);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBooking(@PathVariable Long id) {

        bookingService.deleteBooking(id);

        return ResponseEntity.ok("Booking deleted successfully.");
    }
}