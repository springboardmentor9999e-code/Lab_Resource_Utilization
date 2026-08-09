package com.labresource.platform.service;

import com.labresource.platform.dto.BookingResponse;
import com.labresource.platform.dto.CreateBookingRequest;
import com.labresource.platform.dto.RejectBookingRequest;
import com.labresource.platform.entity.BookingStatus;
import java.util.List;
import org.springframework.security.core.Authentication;

public interface BookingService {

    BookingResponse createBooking(CreateBookingRequest request, Authentication authentication);

    List<BookingResponse> getMyBookings(Authentication authentication);

    BookingResponse getBookingById(Long id, Authentication authentication);

    List<BookingResponse> getAllBookings();

    List<BookingResponse> getBookingsByStatus(BookingStatus status);

    BookingResponse approveBooking(Long id);

    BookingResponse rejectBooking(Long id, RejectBookingRequest request);

    BookingResponse cancelBooking(Long id, Authentication authentication);
}
