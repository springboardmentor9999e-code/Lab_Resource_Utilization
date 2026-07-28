package com.lrplatform.repository;

import com.lrplatform.model.entity.BookingHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingHistoryRepository extends JpaRepository<BookingHistory, Long> {
    List<BookingHistory> findByBookingIdOrderByUpdatedAtDesc(Long bookingId);
}
