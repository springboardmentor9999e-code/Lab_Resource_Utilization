package com.labresource.platform.controller;

import com.labresource.platform.dto.BookingResponse;
import com.labresource.platform.dto.CreateBookingRequest;
import com.labresource.platform.dto.RejectBookingRequest;
import com.labresource.platform.entity.BookingStatus;
import com.labresource.platform.service.BookingService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('ROLE_STUDENT', 'ROLE_ASSISTANT_PROFESSOR', 'ROLE_PROFESSOR', 'ROLE_SYSTEM_ADMIN')")
    public BookingResponse createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            Authentication authentication
    ) {
        return bookingService.createBooking(request, authentication);
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public List<BookingResponse> getMyBookings(Authentication authentication) {
        return bookingService.getMyBookings(authentication);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_ASSISTANT', 'ROLE_HOD', 'ROLE_SYSTEM_ADMIN')")
    public List<BookingResponse> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_ASSISTANT', 'ROLE_HOD', 'ROLE_SYSTEM_ADMIN')")
    public List<BookingResponse> getBookingsByStatus(@PathVariable BookingStatus status) {
        return bookingService.getBookingsByStatus(status);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public BookingResponse getBookingById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return bookingService.getBookingById(id, authentication);
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_ASSISTANT', 'ROLE_SYSTEM_ADMIN')")
    public BookingResponse approveBooking(@PathVariable Long id) {
        return bookingService.approveBooking(id);
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_ASSISTANT', 'ROLE_SYSTEM_ADMIN')")
    public BookingResponse rejectBooking(
            @PathVariable Long id,
            @Valid @RequestBody RejectBookingRequest request
    ) {
        return bookingService.rejectBooking(id, request);
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyAuthority('ROLE_STUDENT', 'ROLE_LAB_ASSISTANT', 'ROLE_ASSISTANT_PROFESSOR', 'ROLE_PROFESSOR', 'ROLE_SYSTEM_ADMIN')")
    public BookingResponse cancelBooking(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return bookingService.cancelBooking(id, authentication);
    }
}
