package com.labhub.repository;

import com.labhub.entity.Booking;
import com.labhub.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

    Page<Booking> findByUserId(UUID userId, Pageable pageable);

    long countByStatus(BookingStatus status);

    List<Booking> findTop5ByOrderByCreatedAtDesc();

    @Query("""
            SELECT b FROM Booking b
            WHERE b.equipment.id = :equipmentId
            AND b.status NOT IN ('CANCELLED', 'COMPLETED', 'NO_SHOW')
            AND b.startTime < :endTime
            AND b.endTime > :startTime
            """)
    List<Booking> findConflictingBookings(
            @Param("equipmentId") UUID equipmentId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    @Query("""
            SELECT b FROM Booking b
            WHERE b.equipment.id = :equipmentId
            AND b.id != :excludeId
            AND b.status NOT IN ('CANCELLED', 'COMPLETED', 'NO_SHOW')
            AND b.startTime < :endTime
            AND b.endTime > :startTime
            """)
    List<Booking> findConflictingBookingsExcluding(
            @Param("equipmentId") UUID equipmentId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("excludeId") UUID excludeId
    );

    @Query("""
            SELECT b FROM Booking b
            WHERE (:status IS NULL OR b.status = :status)
            AND (:userId IS NULL OR b.user.id = :userId)
            """)
    Page<Booking> findWithFilters(
            @Param("status") BookingStatus status,
            @Param("userId") UUID userId,
            Pageable pageable
    );

    @Query("""
            SELECT b FROM Booking b
            WHERE (:status IS NULL OR b.status = :status)
            AND (:userId IS NULL OR b.user.id = :userId)
            AND (b.equipment.department.institution.id = :institutionId OR b.user.department.institution.id = :institutionId)
            """)
    Page<Booking> findWithInstitutionFilters(
            @Param("status") BookingStatus status,
            @Param("userId") UUID userId,
            @Param("institutionId") UUID institutionId,
            Pageable pageable
    );

    @Query("""
            SELECT b FROM Booking b
            WHERE (:status IS NULL OR b.status = :status)
            AND (:userId IS NULL OR b.user.id = :userId)
            AND (b.equipment.department.id = :departmentId OR b.user.department.id = :departmentId)
            """)
    Page<Booking> findWithDepartmentFilters(
            @Param("status") BookingStatus status,
            @Param("userId") UUID userId,
            @Param("departmentId") UUID departmentId,
            Pageable pageable
    );

    @Query("SELECT count(b) FROM Booking b WHERE b.status = :status AND b.equipment.department.institution.id = :instId")
    long countByStatusAndInstitutionId(@Param("status") BookingStatus status, @Param("instId") UUID instId);
}
