package com.infosys.labresourceutilizationplatform.repository;

import com.infosys.labresourceutilizationplatform.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    java.util.List<Booking> findByUserUserId(Integer userId);
    java.util.List<Booking> findByStatus(String status);
    java.util.List<Booking> findByEquipmentIdAndBookingDate(Long equipmentId, java.time.LocalDate bookingDate);
}