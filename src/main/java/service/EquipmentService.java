package com.example.labresourceplatform.service;

import com.example.labresourceplatform.entity.Equipment;
import com.example.labresourceplatform.repository.EquipmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EquipmentService {

    @Autowired
    private EquipmentRepository equipmentRepository;

    // Add Equipment
    public Equipment addEquipment(Equipment equipment) {
        return equipmentRepository.save(equipment);
    }

    // Get All Equipment
    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }

    // Get Equipment by ID
    public Equipment getEquipmentById(Long id) {
        return equipmentRepository.findById(id).orElse(null);
    }

    // Delete Equipment
    public void deleteEquipment(Long id) {
        equipmentRepository.deleteById(id);
    }
}