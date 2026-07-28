package com.lrplatform.repository;

import com.lrplatform.model.entity.SharedEquipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SharedEquipmentRepository extends JpaRepository<SharedEquipment, Long> {
    List<SharedEquipment> findBySharingStatus(String status);
    Boolean existsByEquipmentId(Long equipmentId);
}
