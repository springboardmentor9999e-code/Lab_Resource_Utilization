package com.labplatform.labresourceplatform.repository;

import com.labplatform.labresourceplatform.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    List<Equipment> findByLab_LabId(Long labId);

    List<Equipment> findByLab_Institution_InstitutionId(Long institutionId);

    List<Equipment> findByLab_LabIdAndLab_Institution_InstitutionId(Long labId, Long institutionId);
}
