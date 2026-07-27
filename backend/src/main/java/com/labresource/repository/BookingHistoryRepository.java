package com.labresource.repository;

import com.labresource.entity.BookingHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingHistoryRepository extends JpaRepository<BookingHistory, Long> {

    List<BookingHistory> findByBooking_BookingIdOrderByChangedAtAsc(Long bookingId);
}
