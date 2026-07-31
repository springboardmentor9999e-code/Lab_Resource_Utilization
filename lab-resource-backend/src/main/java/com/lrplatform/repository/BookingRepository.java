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

    @Query(value = "SELECT start_time, end_time FROM bookings WHERE booking_status = 'COMPLETED' AND EXTRACT(MONTH FROM booking_date) = :month AND EXTRACT(YEAR FROM booking_date) = :year", nativeQuery = true)
    List<Object[]> findCompletedBookingTimesByMonth(@Param("month") int month, @Param("year") int year);

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

    @Query(value = "SELECT e.category_id FROM bookings b INNER JOIN equipment e ON b.equipment_id = e.id " +
           "WHERE b.user_id = :userId AND b.booking_status = 'COMPLETED' " +
           "GROUP BY e.category_id ORDER BY COUNT(*) DESC LIMIT :limit", nativeQuery = true)
    List<Long> findTopCategoryIdsByUserId(@Param("userId") Long userId, @Param("limit") int limit);

    @Query(value = "SELECT e.id FROM equipment e WHERE e.status = 'AVAILABLE' " +
           "AND e.id NOT IN (SELECT b.equipment_id FROM bookings b WHERE b.booking_date >= :since) " +
           "AND e.laboratory_id IS NOT NULL", nativeQuery = true)
    List<Long> findIdleEquipmentIdsSince(@Param("since") LocalDate since);

    @Query("SELECT b FROM Booking b WHERE b.recurrenceParentId = :parentId ORDER BY b.bookingDate ASC")
    List<Booking> findByRecurrenceParentId(@Param("parentId") Long parentId);
}
