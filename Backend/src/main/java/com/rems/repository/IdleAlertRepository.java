package com.rems.repository;

import com.rems.entity.IdleAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IdleAlertRepository extends JpaRepository<IdleAlert, Long> {
    Optional<IdleAlert> findByEquipmentEquipmentIdAndResolvedFalse(Long equipmentId);
    List<IdleAlert> findByEquipmentEquipmentId(Long equipmentId);
}
