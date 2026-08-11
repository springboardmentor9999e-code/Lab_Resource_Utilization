package com.infosys.labresourceutilizationplatform.service;

import com.infosys.labresourceutilizationplatform.entity.Equipment;

import java.util.List;

public interface EquipmentService {

    Equipment addEquipment(Equipment equipment);

    List<Equipment> getAllEquipment();

    Equipment getEquipmentById(Long id);

    Equipment updateEquipment(Long id, Equipment equipment);

    void deleteEquipment(Long id);

    List<Equipment> searchEquipment(String equipmentName);

    List<Equipment> getEquipmentByLaboratory(Long laboratoryId);

    List<Equipment> getEquipmentByCategory(String category);

    List<Equipment> getEquipmentByStatus(String status);

    List<Equipment> getEquipmentForUser(String userEmail, Long laboratoryId, String category, String status, String search, String ownershipFilter);

    List<Equipment> getGlobalEquipmentView(Long institutionId, Long departmentId, Long laboratoryId, String ownership, String sharedStatus, String status, String search);

    Equipment updateEquipmentCost(Long id, Double costPerHour);
}