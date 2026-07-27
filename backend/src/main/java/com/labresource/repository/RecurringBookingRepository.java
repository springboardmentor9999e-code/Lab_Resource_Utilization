package com.labresource.repository;

import com.labresource.entity.RecurringBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecurringBookingRepository extends JpaRepository<RecurringBooking, Long> {

    List<RecurringBooking> findByUser_UserIdOrderByCreatedAtDesc(Long userId);
}
