package com.labresource.repository;

import com.labresource.entity.EquipmentDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EquipmentDocumentRepository extends JpaRepository<EquipmentDocument, Long> {

    List<EquipmentDocument> findByEquipment_EquipmentIdOrderByUploadedAtDesc(Long equipmentId);

}
