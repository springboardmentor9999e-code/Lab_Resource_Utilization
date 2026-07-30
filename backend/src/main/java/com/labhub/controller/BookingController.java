package com.labhub.controller;

import com.labhub.dto.booking.BookingRequest;
import com.labhub.dto.booking.BookingResponse;
import com.labhub.dto.common.ApiResponse;
import com.labhub.enums.BookingStatus;
import com.labhub.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST controller for booking management.
 */
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    /**
     * POST /api/bookings — Create a booking
     */
    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody BookingRequest request,
            Authentication authentication) {
        BookingResponse response = bookingService.create(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking created successfully", response));
    }

    /**
     * GET /api/bookings — List bookings with optional filters
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<BookingResponse>>> getAllBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        PageRequest pageable = PageRequest.of(page, size, sort);
        Page<BookingResponse> result = bookingService.getAll(status, userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * GET /api/bookings/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getById(id)));
    }

    /**
     * PATCH /api/bookings/{id}/cancel
     */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @PathVariable UUID id,
            Authentication authentication) {
        BookingResponse response = bookingService.cancel(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled", response));
    }

    /**
     * PATCH /api/bookings/{id}/approve — ADMIN/LAB_MANAGER/LAB_TECHNICIAN
     */
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN','LAB_MANAGER','LAB_TECHNICIAN')")
    public ResponseEntity<ApiResponse<BookingResponse>> approveBooking(
            @PathVariable UUID id,
            Authentication authentication) {
        BookingResponse response = bookingService.approve(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Booking approved", response));
    }

    /**
     * PATCH /api/bookings/{id}/reject — ADMIN/LAB_MANAGER/LAB_TECHNICIAN
     */
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN','LAB_MANAGER','LAB_TECHNICIAN')")
    public ResponseEntity<ApiResponse<BookingResponse>> rejectBooking(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body,
            Authentication authentication) {
        String reason = body != null ? body.getOrDefault("reason", null) : null;
        BookingResponse response = bookingService.reject(id, authentication.getName(), reason);
        return ResponseEntity.ok(ApiResponse.success("Booking rejected", response));
    }

    /**
     * PATCH /api/bookings/{id}/in-use
     */
    @PatchMapping("/{id}/in-use")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN','LAB_MANAGER','LAB_TECHNICIAN')")
    public ResponseEntity<ApiResponse<BookingResponse>> markInUse(
            @PathVariable UUID id,
            Authentication authentication) {
        BookingResponse response = bookingService.markInUse(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Booking marked as in use", response));
    }

    /**
     * PATCH /api/bookings/{id}/returned
     */
    @PatchMapping("/{id}/returned")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN','LAB_MANAGER','LAB_TECHNICIAN')")
    public ResponseEntity<ApiResponse<BookingResponse>> markReturned(
            @PathVariable UUID id,
            Authentication authentication) {
        BookingResponse response = bookingService.markReturned(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Equipment marked as returned", response));
    }

    /**
     * PATCH /api/bookings/{id}/complete
     */
    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN','LAB_MANAGER','LAB_TECHNICIAN')")
    public ResponseEntity<ApiResponse<BookingResponse>> markComplete(
            @PathVariable UUID id,
            Authentication authentication) {
        BookingResponse response = bookingService.markComplete(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Booking marked as completed", response));
    }

    /**
     * GET /api/bookings/suggest-slots
     */
    @GetMapping("/suggest-slots")
    public ResponseEntity<ApiResponse<List<String>>> suggestSlots(
            @RequestParam UUID equipmentId,
            @RequestParam(required = false) String date) {
        List<String> slots = bookingService.suggestNextAvailableSlots(equipmentId, date);
        return ResponseEntity.ok(ApiResponse.success(slots));
    }

    /**
     * GET /api/bookings/recent — for dashboard
     */
    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getRecentBookings() {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getRecentBookings(5)));
    }
}

