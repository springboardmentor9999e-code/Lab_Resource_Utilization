package com.project.Lab.Resource.Utilization.Platform.repository;

import com.project.Lab.Resource.Utilization.Platform.entity.EquipmentCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EquipmentCategoryRepository
        extends JpaRepository<EquipmentCategory, Integer> {
}