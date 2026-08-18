package com.lab.backend.repository;

import com.lab.backend.entity.Equipment;
import com.lab.backend.enums.EquipmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipmentRepository
        extends JpaRepository<Equipment, Long> {

    List<Equipment> findByNameContainingIgnoreCase(String name);
    List<Equipment> findByCategory(String category);
    List<Equipment> findByLaboratoryId(Long laboratoryId);
    List<Equipment> findByStatus(EquipmentStatus status);
    Long countByStatus(EquipmentStatus status);

}