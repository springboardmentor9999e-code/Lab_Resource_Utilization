package com.labhub.service;

import com.labhub.dto.equipment.EquipmentRequest;
import com.labhub.dto.equipment.EquipmentResponse;
import com.labhub.enums.EquipmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface EquipmentService {
    EquipmentResponse create(EquipmentRequest request);
    EquipmentResponse update(UUID id, EquipmentRequest request);
    void delete(UUID id);
    EquipmentResponse getById(UUID id);
    Page<EquipmentResponse> getAll(String search, UUID categoryId, EquipmentStatus status, UUID departmentId, Pageable pageable);
    List<EquipmentResponse> getAllCategories();
}
