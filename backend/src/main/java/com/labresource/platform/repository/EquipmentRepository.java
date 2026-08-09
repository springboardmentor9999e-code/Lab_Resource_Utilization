package com.labresource.platform.repository;

import com.labresource.platform.entity.Equipment;
import com.labresource.platform.entity.EquipmentStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    boolean existsBySerialNumber(String serialNumber);

    long countByStatus(EquipmentStatus status);

    @Query("""
            select sum(equipment.quantity)
            from Equipment equipment
            """)
    Long sumQuantity();

    @Query("""
            select sum(equipment.availableQuantity)
            from Equipment equipment
            """)
    Long sumAvailableQuantity();

    @Query("""
            select equipment
            from Equipment equipment
            join fetch equipment.lab
            """)
    List<Equipment> findAllWithLab();

    List<Equipment> findByLabId(Long labId);

    List<Equipment> findByStatus(EquipmentStatus status);

    List<Equipment> findByLabIdAndStatus(Long labId, EquipmentStatus status);
}
