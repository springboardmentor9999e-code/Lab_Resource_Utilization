package com.lrplatform.repository;

import com.lrplatform.model.entity.Booking;
import com.lrplatform.model.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Booking> findByEquipmentIdAndBookingDate(Long equipmentId, LocalDate date);
    List<Booking> findByStatus(BookingStatus status);
    long countByStatus(BookingStatus status);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status IN :statuses")
    long countByStatusIn(@Param("statuses") List<BookingStatus> statuses);

    @Query("SELECT b FROM Booking b WHERE b.equipment.laboratory.department.institution.id = :institutionId ORDER BY b.bookingDate DESC, b.startTime DESC")
    List<Booking> findByEquipmentInstitutionId(@Param("institutionId") Long institutionId);

    @Query("SELECT b FROM Booking b WHERE b.equipment.laboratory.department.id = :departmentId ORDER BY b.bookingDate DESC, b.startTime DESC")
    List<Booking> findByEquipmentDepartmentId(@Param("departmentId") Long departmentId);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.equipment.laboratory.department.id = :departmentId")
    Long countByEquipmentLaboratoryDepartmentId(@Param("departmentId") Long departmentId);

    @Query(value = "SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (b.end_time - b.start_time)) / 3600), 0) FROM bookings b WHERE b.booking_status = 'COMPLETED' AND EXTRACT(MONTH FROM b.booking_date) = :month AND EXTRACT(YEAR FROM b.booking_date) = :year", nativeQuery = true)
    Long sumCompletedBookingHoursByMonth(@Param("month") int month, @Param("year") int year);

    @Query("SELECT b FROM Booking b WHERE b.equipment.id = :equipmentId " +
           "AND b.bookingDate = :date " +
           "AND b.status NOT IN ('CANCELLED', 'REJECTED') " +
           "AND b.startTime < :endTime AND b.endTime > :startTime")
    List<Booking> findConflictingBookings(
            @Param("equipmentId") Long equipmentId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );

    @Query("SELECT b FROM Booking b WHERE b.status = :status AND b.equipment.laboratory.department.id = :departmentId ORDER BY b.bookingDate DESC, b.startTime DESC")
    List<Booking> findByStatusAndEquipmentDepartmentId(@Param("status") BookingStatus status, @Param("departmentId") Long departmentId);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.equipment.laboratory.department.institution.id = :institutionId")
    Long countByEquipmentLaboratoryDepartmentInstitutionId(@Param("institutionId") Long institutionId);

    @Query("SELECT b.status, COUNT(b) FROM Booking b WHERE b.equipment.laboratory.department.id = :departmentId GROUP BY b.status")
    List<Object[]> countByStatusGroupedByDepartmentId(@Param("departmentId") Long departmentId);

    @Query("SELECT b.status, COUNT(b) FROM Booking b WHERE b.equipment.laboratory.department.institution.id = :institutionId GROUP BY b.status")
    List<Object[]> countByStatusGroupedByInstitutionId(@Param("institutionId") Long institutionId);
}
