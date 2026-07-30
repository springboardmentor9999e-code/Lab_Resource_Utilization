package com.infosys.labresourceutilizationplatform.service;

import com.infosys.labresourceutilizationplatform.entity.Equipment;

import java.util.List;

public interface EquipmentService {

    // Add new equipment
    Equipment addEquipment(Equipment equipment);

    // Get all equipment
    List<Equipment> getAllEquipment();

    // Get equipment by ID
    Equipment getEquipmentById(Long id);

    // Update equipment
    Equipment updateEquipment(Long id, Equipment equipment);

    // Delete equipment
    void deleteEquipment(Long id);

    // Search equipment by name
    List<Equipment> searchEquipment(String equipmentName);

    // Get equipment by laboratory
    List<Equipment> getEquipmentByLaboratory(Long laboratoryId);

    // Get equipment by category
    List<Equipment> getEquipmentByCategory(String category);

    // Get equipment by status
    List<Equipment> getEquipmentByStatus(String status);
}