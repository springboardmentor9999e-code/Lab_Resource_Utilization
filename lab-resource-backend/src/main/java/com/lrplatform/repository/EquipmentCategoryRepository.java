package com.lrplatform.repository;

import com.lrplatform.model.entity.EquipmentCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipmentCategoryRepository extends JpaRepository<EquipmentCategory, Long> {
    Boolean existsByCategoryName(String name);
}
