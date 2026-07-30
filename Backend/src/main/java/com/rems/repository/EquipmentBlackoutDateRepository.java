package com.rems.repository;

import com.rems.entity.EquipmentBlackoutDate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EquipmentBlackoutDateRepository extends JpaRepository<EquipmentBlackoutDate, Long> {
    List<EquipmentBlackoutDate> findByEquipmentEquipmentIdAndBlackoutDate(Long equipmentId, LocalDate date);
    List<EquipmentBlackoutDate> findByEquipmentEquipmentIdAndBlackoutDateBetween(Long equipmentId, LocalDate start, LocalDate end);
}
