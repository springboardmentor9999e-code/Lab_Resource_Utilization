package com.labresource.backend.repository;

import com.labresource.backend.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    long countByStatus(String status);

    // Student / Faculty
    List<Booking> findByUserUserId(Long userId);

    // Lab Assistant
    List<Booking> findByBookingDate(LocalDate bookingDate);

    // Pending Bookings
    List<Booking> findByStatus(String status);

    List<Booking> findByLaboratoryInstitutionInstitutionId(Long institutionId);

}