package com.labresource.repository;

import com.labresource.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Read-only aggregate queries over Booking for the Utilization Monitoring module.
 * A second Spring Data interface over the same entity, kept separate so this
 * module never touches the Booking module's repository.
 */
@Repository
public interface UtilizationBookingRepository extends JpaRepository<Booking, Long> {

    @Query("SELECT b FROM Booking b " +
           "JOIN FETCH b.equipment e " +
           "LEFT JOIN FETCH e.department " +
           "LEFT JOIN FETCH e.lab " +
           "WHERE b.bookingDate >= :from AND b.bookingDate <= :to AND b.status IN :statuses")
    List<Booking> findInWindow(@Param("from") LocalDate from,
                               @Param("to") LocalDate to,
                               @Param("statuses") List<String> statuses);

    @Query("SELECT b FROM Booking b " +
           "JOIN FETCH b.equipment e " +
           "LEFT JOIN FETCH e.department " +
           "LEFT JOIN FETCH e.lab " +
           "WHERE b.equipment.equipmentId = :equipmentId " +
           "AND b.bookingDate >= :from AND b.bookingDate <= :to AND b.status IN :statuses")
    List<Booking> findInWindowForEquipment(@Param("equipmentId") Long equipmentId,
                                           @Param("from") LocalDate from,
                                           @Param("to") LocalDate to,
                                           @Param("statuses") List<String> statuses);

    // One row per equipment that has ever had a booking in the given statuses: [equipmentId, MAX(bookingDate)]
    @Query("SELECT b.equipment.equipmentId, MAX(b.bookingDate) FROM Booking b " +
           "WHERE b.status IN :statuses GROUP BY b.equipment.equipmentId")
    List<Object[]> findLastBookingDates(@Param("statuses") List<String> statuses);

    /**
     * As {@link #findInWindow} but also fetching the booking's user and both institutions, so the
     * shared-vs-exclusive split can tell an external booking from an internal one without firing
     * a lazy-load per row.
     */
    @Query("SELECT b FROM Booking b " +
           "JOIN FETCH b.equipment e " +
           "LEFT JOIN FETCH e.institution " +
           "LEFT JOIN FETCH e.department " +
           "JOIN FETCH b.user u " +
           "LEFT JOIN FETCH u.institution " +
           "WHERE b.bookingDate >= :from AND b.bookingDate <= :to AND b.status IN :statuses")
    List<Booking> findInWindowWithParties(@Param("from") LocalDate from,
                                          @Param("to") LocalDate to,
                                          @Param("statuses") List<String> statuses);
}
