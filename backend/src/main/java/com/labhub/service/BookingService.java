package com.labhub.service;

import com.labhub.dto.booking.BookingRequest;
import com.labhub.dto.booking.BookingResponse;
import com.labhub.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface BookingService {
    BookingResponse create(BookingRequest request, String userEmail);
    BookingResponse getById(UUID id);
    Page<BookingResponse> getAll(BookingStatus status, UUID userId, Pageable pageable);
    BookingResponse cancel(UUID id, String userEmail);
    BookingResponse approve(UUID id, String approverEmail);
    BookingResponse reject(UUID id, String approverEmail, String reason);
    BookingResponse markInUse(UUID id, String userEmail);
    BookingResponse markReturned(UUID id, String userEmail);
    BookingResponse markComplete(UUID id, String userEmail);
    List<BookingResponse> getRecentBookings(int limit);
    List<BookingResponse> getMyBookings(String userEmail, int limit);
    List<String> suggestNextAvailableSlots(UUID equipmentId, String dateStr);
}

