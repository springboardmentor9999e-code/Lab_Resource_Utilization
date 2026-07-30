package com.rems.controller;

import com.rems.dto.BookingRequest;
import com.rems.dto.BookingResponse;
import com.rems.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasAuthority('create_booking')")
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest request, Principal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.createBooking(request, principal.getName()));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAuthority('view_own_bookings')")
    public ResponseEntity<List<BookingResponse>> getMyBookings(Principal principal) {
        return ResponseEntity.ok(bookingService.getMyBookings(principal.getName()));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAuthority('approve_bookings')")
    public ResponseEntity<List<BookingResponse>> getPendingBookings(Principal principal) {
        return ResponseEntity.ok(bookingService.getPendingBookings(principal.getName()));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('approve_bookings')")
    public ResponseEntity<BookingResponse> approveBooking(
            @PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(bookingService.approveBooking(id, principal.getName()));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAuthority('approve_bookings')")
    public ResponseEntity<BookingResponse> rejectBooking(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "") String remarks,
            Principal principal) {
        return ResponseEntity.ok(bookingService.rejectBooking(id, principal.getName(), remarks));
    }

    @PostMapping("/{id}/return")
    @PreAuthorize("hasAuthority('create_booking') or hasAuthority('view_own_bookings')")
    public ResponseEntity<BookingResponse> returnEquipment(
            @PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(bookingService.returnEquipment(id, principal.getName()));
    }

    @PatchMapping("/{id}/approve-return")
    @PreAuthorize("hasAuthority('approve_bookings')")
    public ResponseEntity<BookingResponse> approveReturn(
            @PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(bookingService.approveReturn(id, principal.getName()));
    }
}
