package com.labresource.platform.service;

import com.labresource.platform.dto.CreateEquipmentRequest;
import com.labresource.platform.dto.EquipmentResponse;
import com.labresource.platform.dto.UpdateEquipmentRequest;
import com.labresource.platform.entity.EquipmentStatus;
import java.util.List;

public interface EquipmentService {

    EquipmentResponse createEquipment(CreateEquipmentRequest request);

    List<EquipmentResponse> getAllEquipment();

    EquipmentResponse getEquipmentById(Long id);

    List<EquipmentResponse> getEquipmentByLab(Long labId);

    List<EquipmentResponse> getEquipmentByStatus(EquipmentStatus status);

    List<EquipmentResponse> getEquipmentByLabAndStatus(Long labId, EquipmentStatus status);

    EquipmentResponse updateEquipment(Long id, UpdateEquipmentRequest request);

    void deleteEquipment(Long id);
}
