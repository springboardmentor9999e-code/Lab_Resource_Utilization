package com.example.hello.repository;

import com.example.hello.entity.Booking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Integer> {

    // ============================================================
    // BOOKINGS BY USER
    // ============================================================

    List<Booking> findByUserId(Integer userId);


    // ============================================================
    // BOOKINGS BY EQUIPMENT AND STATUS
    // ============================================================

    List<Booking> findByEquipmentIdAndStatusIn(
            Integer equipmentId,
            List<String> statuses
    );


    // ============================================================
    // FIRST WAITLISTED BOOKING FOR EQUIPMENT
    // ============================================================

    Optional<Booking> findFirstByEquipmentIdAndStatusOrderByCreatedAtAsc(
            Integer equipmentId,
            String status
    );


    // ============================================================
    // BOOKINGS FOR MULTIPLE EQUIPMENT
    // ============================================================

    List<Booking> findByEquipmentIdIn(
            List<Integer> equipmentIds
    );


    // ============================================================
    // CHECK WHETHER EQUIPMENT HAS BOOKINGS
    // ============================================================

    boolean existsByEquipmentId(Integer equipmentId);


    // ============================================================
    // BOOKINGS RELATED TO AN INSTITUTION
    //
    // Includes:
    // 1. Bookings of equipment belonging to institution
    // 2. Bookings made by users belonging to institution
    // ============================================================

    @Query("""
        SELECT b
        FROM Booking b
        WHERE b.equipmentId IN
            (
                SELECT e.equipmentId
                FROM Equipment e
                WHERE e.institutionId = :institutionId
            )
        OR b.userId IN
            (
                SELECT u.userId
                FROM User u
                WHERE u.institutionId = :institutionId
            )
        ORDER BY b.bookingId ASC
    """)
    List<Booking> findBookingsByInstitution(
            @Param("institutionId") Integer institutionId
    );


    // ============================================================
    // BOOKINGS FOR A DEPARTMENT
    //
    // Department Head should see bookings for equipment
    // belonging to their department.
    // ============================================================

    @Query("""
        SELECT b
        FROM Booking b
        WHERE b.equipmentId IN
            (
                SELECT e.equipmentId
                FROM Equipment e
                WHERE e.departmentId = :departmentId
            )
        ORDER BY b.bookingId ASC
    """)
    List<Booking> findBookingsByDepartment(
            @Param("departmentId") Integer departmentId
    );

}