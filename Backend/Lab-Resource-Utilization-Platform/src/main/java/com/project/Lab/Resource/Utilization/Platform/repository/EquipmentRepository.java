package com.project.Lab.Resource.Utilization.Platform.repository;

import com.project.Lab.Resource.Utilization.Platform.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EquipmentRepository extends JpaRepository<Equipment, Integer> {

    List<Equipment> findByEquipmentNameContainingIgnoreCase(String equipmentName);

    List<Equipment> findByStatus(String status);
    long countByStatus(String status);


}