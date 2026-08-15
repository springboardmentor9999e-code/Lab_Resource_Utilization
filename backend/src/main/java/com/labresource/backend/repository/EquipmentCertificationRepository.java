package com.labresource.backend.repository;

import com.labresource.backend.entity.EquipmentCertification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EquipmentCertificationRepository
        extends JpaRepository<EquipmentCertification, Long> {

    // Equipment-wise certificates
    List<EquipmentCertification> findByEquipmentEquipmentId(Long equipmentId);

    // Certificates expiring before a given date
    List<EquipmentCertification> findByExpiryDateBefore(LocalDate date);

    // Certificates by status
    List<EquipmentCertification> findByStatus(String status);
    List<EquipmentCertification> findByEquipmentLaboratoryInstitutionInstitutionId(Long institutionId);

    List<EquipmentCertification> findByEquipmentLaboratoryLabId(Long labId);
}