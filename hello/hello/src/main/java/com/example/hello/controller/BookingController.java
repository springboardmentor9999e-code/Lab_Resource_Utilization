package com.example.hello.controller;

import com.example.hello.entity.Booking;
import com.example.hello.entity.User;
import com.example.hello.repository.UserRepository;
import com.example.hello.service.BookingService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/booking")
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {

    @Autowired
    private BookingService service;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('SYSTEM_ADMIN','RESEARCHER')")
    public List<Booking> getBookings(Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole().getRoleName().equals("SYSTEM_ADMIN")) {
            return service.getAllBookings();
        }

        return service.getBookingsByUser(user.getUserId());
    }
    @GetMapping("/available/{equipmentId}")
    public boolean isAvailable(@PathVariable Integer equipmentId){

        return service.isEquipmentAvailable(equipmentId);

    }

    @PostMapping
    @PreAuthorize("hasAuthority('RESEARCHER')")
    public Booking addBooking(@RequestBody Booking booking,
                              Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        booking.setUserId(user.getUserId());

        if (booking.getStatus() == null || booking.getStatus().isBlank()) {
            booking.setStatus("PENDING");
        }

        return service.saveBooking(booking);
    }

    @GetMapping("/{id}")
    public Booking getBooking(@PathVariable Integer id) {
        return service.getBookingById(id);
    }

    @PutMapping("/{id}")
    public Booking updateBooking(@PathVariable Integer id,
                                 @RequestBody Booking booking) {

        booking.setBookingId(id);
        return service.saveBooking(booking);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('SYSTEM_ADMIN')")
    public void deleteBooking(@PathVariable Integer id) {
        service.deleteBooking(id);
    }
}