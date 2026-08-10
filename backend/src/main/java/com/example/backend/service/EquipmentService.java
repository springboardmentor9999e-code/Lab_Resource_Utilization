package com.example.backend.service;

import com.example.backend.entity.Equipment;
import java.util.List;

public interface EquipmentService {

    // Add Equipment
    Equipment saveEquipment(Equipment equipment);

    // Get All Equipment
    List<Equipment> getAllEquipment();

    // Get Equipment By ID
    Equipment getEquipmentById(Integer id);

    // Update Equipment
    Equipment updateEquipment(Equipment equipment);

    // Delete Equipment
    void deleteEquipment(Integer id);
}