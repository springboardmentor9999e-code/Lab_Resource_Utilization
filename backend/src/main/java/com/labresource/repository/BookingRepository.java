package com.labresource.repository;

import com.labresource.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUser_UserId(Long userId);

    List<Booking> findByStatus(String status);

    long countByStatus(String status);

    // Legacy method name kept for existing callers — APPROVED was renamed to CONFIRMED.
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status IN ('APPROVED', 'CONFIRMED')")
    long countApprovedBookings();

    List<Booking> findByEquipment_EquipmentIdAndBookingDate(Long equipmentId, LocalDate date);

    // Calendar range query — active bookings between two dates, optionally per equipment.
    @Query("SELECT b FROM Booking b JOIN FETCH b.equipment JOIN FETCH b.user " +
           "WHERE b.bookingDate BETWEEN :from AND :to " +
           "AND b.status IN ('PENDING', 'APPROVED', 'CONFIRMED', 'IN_USE') " +
           "AND (:equipmentId IS NULL OR b.equipment.equipmentId = :equipmentId)")
    List<Booking> findActiveInRange(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            @Param("equipmentId") Long equipmentId
    );

    List<Booking> findByRecurringBooking_RecurringIdAndStatusIn(Long recurringId, List<String> statuses);

    // Confirmed bookings on a given date — used by the day-before reminder job.
    @Query("SELECT b FROM Booking b JOIN FETCH b.equipment JOIN FETCH b.user " +
           "WHERE b.bookingDate = :date AND b.status IN ('APPROVED', 'CONFIRMED')")
    List<Booking> findConfirmedOnDate(@Param("date") LocalDate date);

    // One row per day: [bookingDate, COUNT] over a window — dashboard weekly trend
    @Query("SELECT b.bookingDate, COUNT(b) FROM Booking b " +
           "WHERE b.bookingDate BETWEEN :from AND :to " +
           "AND b.status NOT IN ('CANCELLED', 'REJECTED') " +
           "GROUP BY b.bookingDate ORDER BY b.bookingDate")
    List<Object[]> countPerDay(@Param("from") LocalDate from, @Param("to") LocalDate to);

    // Query to check for overlapping active bookings for a specific equipment.
    // Active = anything not terminal (APPROVED kept for legacy rows not yet migrated).
    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.equipment.equipmentId = :equipmentId " +
           "AND b.bookingDate = :date AND b.status IN ('PENDING', 'APPROVED', 'CONFIRMED', 'IN_USE') " +
           "AND b.startTime < :endTime AND b.endTime > :startTime")
    boolean hasOverlappingBooking(
            @Param("equipmentId") Long equipmentId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );
}
