package com.lab.backend.repository;

import com.lab.backend.entity.ResourceShare;
import com.lab.backend.enums.ResourceShareStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceShareRepository extends JpaRepository<ResourceShare, Long> {

    List<ResourceShare> findByStatus(ResourceShareStatus status);

    List<ResourceShare> findByEquipmentId(Long equipmentId);

    List<ResourceShare> findBySourceLaboratoryId(Long sourceLaboratoryId);

    List<ResourceShare> findByTargetLaboratoryId(Long targetLaboratoryId);

    Long countByStatus(ResourceShareStatus status);
}
