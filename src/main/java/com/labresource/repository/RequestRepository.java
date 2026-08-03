package com.labresource.repository;

import com.labresource.entity.EquipmentRequestEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RequestRepository extends JpaRepository<EquipmentRequestEntity, Long> {
}
