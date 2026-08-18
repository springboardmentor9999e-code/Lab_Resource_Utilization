package com.lab.backend.repository;

import com.lab.backend.entity.Maintenance;
import com.lab.backend.entity.MaintenanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {

    List<Maintenance> findByStatus(MaintenanceStatus status);

    List<Maintenance> findByEquipmentId(Long equipmentId);

    boolean existsByEquipmentIdAndStatusIn(Long equipmentId, List<MaintenanceStatus> statuses);

    default boolean existsByEquipmentIdAndStatusInIgnoreCase(Long equipmentId, List<String> statuses) {
        if (statuses == null || statuses.isEmpty()) return false;
        List<MaintenanceStatus> enumStatuses = statuses.stream()
                .map(s -> {
                    try {
                        return MaintenanceStatus.valueOf(s.toUpperCase());
                    } catch (Exception e) {
                        return null;
                    }
                })
                .filter(s -> s != null)
                .toList();
        return existsByEquipmentIdAndStatusIn(equipmentId, enumStatuses);
    }
}