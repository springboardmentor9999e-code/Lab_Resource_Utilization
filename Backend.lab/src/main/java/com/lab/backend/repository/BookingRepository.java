package com.lab.backend.repository;

import com.lab.backend.entity.Booking;
import com.lab.backend.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Count bookings by status
    Long countByStatus(BookingStatus status);

    boolean existsByEquipmentIdAndStatusIn(Long equipmentId, List<BookingStatus> statuses);

    List<Booking> findByEquipmentIdAndStatusIn(Long equipmentId, List<BookingStatus> statuses);

    List<Booking> findByUserId(Long userId);

    List<Booking> findByEquipmentId(Long equipmentId);

    List<Booking> findByEquipmentIdOrderByBookingDate(Long equipmentId);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByEquipmentIdAndStatusInAndBookingDateLessThanEqualAndReturnDateGreaterThanEqual(
            Long equipmentId, List<BookingStatus> statuses, LocalDate returnDate, LocalDate bookingDate
    );

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.equipment.id = ?1 AND b.status <> 'CANCELLED' AND b.bookingDate <= ?3 AND b.returnDate >= ?2")
    long countConflictingBookings(Long equipmentId, LocalDate startDate, LocalDate endDate);
}