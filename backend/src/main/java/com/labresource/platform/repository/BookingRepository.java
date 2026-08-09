package com.labresource.platform.repository;

import com.labresource.platform.entity.Booking;
import com.labresource.platform.entity.BookingStatus;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    long countByStatus(BookingStatus status);

    List<Booking> findByUserId(Long userId);

    List<Booking> findByEquipmentId(Long equipmentId);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByUserIdAndStatus(Long userId, BookingStatus status);

    @Query("""
            select booking
            from Booking booking
            where booking.equipment.id = :equipmentId
                    and booking.status = :status
                    and booking.startTime < :endTime
                    and booking.endTime > :startTime
            """)
    List<Booking> findOverlappingByEquipmentIdAndStatus(
            @Param("equipmentId") Long equipmentId,
            @Param("status") BookingStatus status,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    @Query("""
            select booking
            from Booking booking
            join fetch booking.equipment equipment
            join fetch equipment.lab
            where booking.status = :status
                    and booking.startTime < :to
                    and booking.endTime > :from
            """)
    List<Booking> findOverlappingByStatus(
            @Param("status") BookingStatus status,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );
}
