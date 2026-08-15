package com.labresource.backend.repository;

import com.labresource.backend.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    long countByStatus(String status);

    // Student / Faculty
    List<Booking> findByUserUserId(Long userId);

    List<Booking> findByUserDepartmentAndUserInstitutionInstitutionId(
        String department,
        Long institutionId
);

    // Lab Assistant
    List<Booking> findByLaboratoryLabId(Long labId);

    // Lab Assistant
    List<Booking> findByBookingDate(LocalDate bookingDate);

    // Pending Bookings
    List<Booking> findByStatus(String status);

    List<Booking> findByLaboratoryInstitutionInstitutionId(Long institutionId);

    List<Booking> findByEquipmentEquipmentId(Long equipmentId);

    List<Booking> findByEquipmentEquipmentIdAndStatus(
            Long equipmentId,
            String status
    );
    long countByUserUserId(Long userId);

long countByUserUserIdAndStatus(Long userId, String status);

long countByLaboratoryInstitutionInstitutionId(Long institutionId);

long countByLaboratoryInstitutionInstitutionIdAndStatus(
        Long institutionId,
        String status
);

@Query("""
    SELECT b.equipment.equipmentName, COUNT(b)
    FROM Booking b
    WHERE b.user.userId = :userId
    AND b.equipment IS NOT NULL
    GROUP BY b.equipment.equipmentName
    ORDER BY COUNT(b) DESC
""")
List<Object[]> getUserEquipmentHistory(Long userId);

    @Query("""
    SELECT HOUR(b.startTime), COUNT(b)
    FROM Booking b
    WHERE b.status = 'COMPLETED'
    GROUP BY HOUR(b.startTime)
    ORDER BY HOUR(b.startTime)
    """)
    List<Object[]> getPeakUsageData();

    @Query("""
    SELECT
    e.equipmentName,
    COUNT(b.bookingId)
    FROM Booking b
    JOIN b.equipment e
    GROUP BY e.equipmentName
    ORDER BY COUNT(b.bookingId) DESC
    """)
    List<Object[]> getEquipmentUtilizationReport();

    

}