package com.lab.backend.repository;

import com.lab.backend.entity.ExternalBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExternalBookingRepository extends JpaRepository<ExternalBooking, Long> {
    List<ExternalBooking> findByExternalUserEmail(String externalUserEmail);
    List<ExternalBooking> findByStatus(String status);
    List<ExternalBooking> findByEquipmentId(Long equipmentId);
}
