package com.labresource.service.interfaces;

import com.labresource.dto.request.BookingRequest;
import com.labresource.dto.request.RecurringBookingRequest;
import com.labresource.dto.response.BookingHistoryResponse;
import com.labresource.dto.response.BookingResponse;
import com.labresource.dto.response.RecurringBookingResponse;

import java.time.LocalDate;
import java.util.List;

public interface BookingService {

    BookingResponse createBooking(BookingRequest request, String username);

    List<BookingResponse> getMyBookings(String username);

    List<BookingResponse> getAllBookings();

    /**
     * Status model: PENDING -> CONFIRMED | REJECTED | CANCELLED;
     * CONFIRMED -> IN_USE | CANCELLED | NO_SHOW; IN_USE -> COMPLETED.
     * Terminal: COMPLETED, CANCELLED, REJECTED, NO_SHOW.
     * Legacy input 'APPROVED' is normalized to CONFIRMED.
     * Role gates are enforced inside the implementation.
     */
    BookingResponse updateBookingStatus(Long id, String status, String managerUsername);

    /** Audit trail for one booking, oldest first. Owner or managers only. */
    List<BookingHistoryResponse> getBookingHistory(Long bookingId, String callerUsername);

    /** Active bookings between two dates (inclusive) for the availability calendar. */
    List<BookingResponse> getBookingsInRange(LocalDate from, LocalDate to, Long equipmentId);

    /**
     * Create a DAILY or WEEKLY series: one PENDING booking per occurrence.
     * Conflicting dates are skipped (not fatal) and reported in the response.
     */
    RecurringBookingResponse createRecurringBooking(RecurringBookingRequest request, String username);

    List<RecurringBookingResponse> getMyRecurringBookings(String username);

    /** Cancel the series and every still-active (PENDING/CONFIRMED) occurrence. */
    RecurringBookingResponse cancelRecurringBooking(Long recurringId, String callerUsername);
}
