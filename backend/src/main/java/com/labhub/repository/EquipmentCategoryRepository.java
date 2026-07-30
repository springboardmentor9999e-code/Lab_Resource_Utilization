package com.labhub.repository;

import com.labhub.entity.EquipmentCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EquipmentCategoryRepository extends JpaRepository<EquipmentCategory, UUID> {
    Optional<EquipmentCategory> findByName(String name);
    boolean existsByName(String name);
}
