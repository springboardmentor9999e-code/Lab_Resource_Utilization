package com.example.backend.repository;

import com.example.backend.dto.UtilizationHeatMapDTO;
import com.example.backend.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query(value = """
        SELECT
            e.equipment_name AS equipmentName,
            COALESCE(COUNT(b.booking_id), 0) AS bookingCount
        FROM equipment e
        LEFT JOIN bookings b
            ON e.id = b.equipment_id
        GROUP BY e.id, e.equipment_name
        ORDER BY e.equipment_name
        """, nativeQuery = true)
    List<Object[]> getHeatMapData();

}