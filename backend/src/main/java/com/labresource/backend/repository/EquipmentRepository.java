package com.labresource.backend.repository;

import com.labresource.backend.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    List<Equipment> findByLaboratoryLabId(Long labId);
    long countByStatus(String status);
    List<Equipment> findByLaboratoryInstitutionInstitutionId(Long institutionId);
}
