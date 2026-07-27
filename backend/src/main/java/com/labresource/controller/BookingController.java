package com.labresource.controller;

import com.labresource.dto.request.BookingRequest;
import com.labresource.dto.request.RecurringBookingRequest;
import com.labresource.dto.response.BookingHistoryResponse;
import com.labresource.dto.response.BookingResponse;
import com.labresource.dto.response.RecurringBookingResponse;
import com.labresource.dto.response.SchedulingSuggestionResponse;
import com.labresource.service.impl.SchedulingOptimizerService;
import com.labresource.service.interfaces.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final SchedulingOptimizerService schedulingOptimizerService;

    /**
     * Rule-based scheduling optimization: ranked alternatives for a slot that could not be booked.
     * Open to any authenticated user — it only reveals availability, which the calendar shows anyway.
     */
    @GetMapping("/suggestions")
    public ResponseEntity<List<SchedulingSuggestionResponse>> getSuggestions(
            @RequestParam Long equipmentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime endTime,
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(
                schedulingOptimizerService.suggest(equipmentId, date, startTime, endTime, limit));
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest request,
            Principal principal
    ) {
        BookingResponse response = bookingService.createBooking(request, principal.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getBookings(
            Principal principal,
            Authentication authentication
    ) {
        boolean isManagerOrAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SYSTEM_ADMIN")
                            || a.getAuthority().equals("ROLE_INSTITUTION_ADMIN")
                            || a.getAuthority().equals("ROLE_DEPARTMENT_HEAD")
                            || a.getAuthority().equals("ROLE_LAB_MANAGER")
                            || a.getAuthority().equals("ROLE_LAB_TECHNICIAN"));

        List<BookingResponse> response;
        if (isManagerOrAdmin) {
            response = bookingService.getAllBookings();
        } else {
            response = bookingService.getMyBookings(principal.getName());
        }
        return ResponseEntity.ok(response);
    }

    /**
     * Kept as PUT /{id}/status?status=X for backward compatibility.
     * Per-status role gates (approve/reject vs operate vs owner-cancel)
     * are enforced inside BookingServiceImpl.
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<BookingResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Principal principal
    ) {
        BookingResponse response = bookingService.updateBookingStatus(id, status, principal.getName());
        return ResponseEntity.ok(response);
    }

    /** Audit trail — every status change of a booking, oldest first. */
    @GetMapping("/{id}/history")
    public ResponseEntity<List<BookingHistoryResponse>> getHistory(
            @PathVariable Long id,
            Principal principal
    ) {
        return ResponseEntity.ok(bookingService.getBookingHistory(id, principal.getName()));
    }

    /** Availability calendar feed — active bookings between two dates. */
    @GetMapping("/calendar")
    public ResponseEntity<List<BookingResponse>> getCalendar(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long equipmentId
    ) {
        return ResponseEntity.ok(bookingService.getBookingsInRange(from, to, equipmentId));
    }

    // ------------------------------------------------------------------
    // Recurring bookings
    // ------------------------------------------------------------------

    @PostMapping("/recurring")
    public ResponseEntity<RecurringBookingResponse> createRecurring(
            @Valid @RequestBody RecurringBookingRequest request,
            Principal principal
    ) {
        RecurringBookingResponse response = bookingService.createRecurringBooking(request, principal.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/recurring/my")
    public ResponseEntity<List<RecurringBookingResponse>> getMyRecurring(Principal principal) {
        return ResponseEntity.ok(bookingService.getMyRecurringBookings(principal.getName()));
    }

    @DeleteMapping("/recurring/{id}")
    public ResponseEntity<RecurringBookingResponse> cancelRecurring(
            @PathVariable Long id,
            Principal principal
    ) {
        return ResponseEntity.ok(bookingService.cancelRecurringBooking(id, principal.getName()));
    }
}
