package com.labplatform.labresourceplatform.repository;

import com.labplatform.labresourceplatform.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUser_UserId(Long userId);

    List<Booking> findByEquipment_EquipmentIdAndStatusOrderByCreatedAtAsc(Long equipmentId, String status);

    // Finds active bookings (Pending Approval / Confirmed / In Use) for the same equipment
    // whose time range overlaps the requested window - used to detect scheduling conflicts.
    @Query("SELECT b FROM Booking b WHERE b.equipment.equipmentId = :equipmentId " +
           "AND b.status IN ('Pending Approval', 'Confirmed', 'In Use') " +
           "AND b.startTime < :endTime AND b.endTime > :startTime")
    List<Booking> findOverlappingBookings(@Param("equipmentId") Long equipmentId,
                                           @Param("startTime") LocalDateTime startTime,
                                           @Param("endTime") LocalDateTime endTime);

    // Same as findOverlappingBookings, but excludes one booking id from the results -
    // needed when re-checking a booking's own updated time range (it would otherwise
    // always "conflict" with its own prior row) or when re-validating a waitlisted
    // booking before promoting it.
    @Query("SELECT b FROM Booking b WHERE b.equipment.equipmentId = :equipmentId " +
           "AND b.bookingId <> :excludeBookingId " +
           "AND b.status IN ('Pending Approval', 'Confirmed', 'In Use') " +
           "AND b.startTime < :endTime AND b.endTime > :startTime")
    List<Booking> findOverlappingBookingsExcluding(@Param("equipmentId") Long equipmentId,
                                                    @Param("startTime") LocalDateTime startTime,
                                                    @Param("endTime") LocalDateTime endTime,
                                                    @Param("excludeBookingId") Long excludeBookingId);
}
