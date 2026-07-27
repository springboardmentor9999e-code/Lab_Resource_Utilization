package com.labresource.repository;

import com.labresource.entity.EquipmentImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EquipmentImageRepository extends JpaRepository<EquipmentImage, Long> {

    List<EquipmentImage> findByEquipment_EquipmentIdOrderByUploadedAtAsc(Long equipmentId);

}
