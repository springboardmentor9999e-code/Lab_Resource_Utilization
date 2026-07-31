package com.project.Lab.Resource.Utilization.Platform.service;

import com.project.Lab.Resource.Utilization.Platform.entity.Equipment;
import com.project.Lab.Resource.Utilization.Platform.repository.EquipmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EquipmentService {

    @Autowired
    private EquipmentRepository equipmentRepository;

    // Create Equipment
    public Equipment saveEquipment(Equipment equipment) {
        equipment.setCreatedAt(LocalDateTime.now());
        return equipmentRepository.save(equipment);
    }

    // Get All Equipment
    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }

    // Get Equipment By Id
    public Equipment getEquipmentById(Integer id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Equipment not found"));
    }

    // Search Equipment By Name
    public List<Equipment> searchEquipment(String equipmentName) {
        return equipmentRepository
                .findByEquipmentNameContainingIgnoreCase(equipmentName);
    }

    // Filter Equipment By Status
    public List<Equipment> getEquipmentByStatus(String status) {
        return equipmentRepository.findByStatus(status);
    }

    // Dashboard Counts
    public Map<String, Long> getEquipmentDashboard() {

        Map<String, Long> dashboard = new HashMap<>();

        dashboard.put("totalEquipment",
                equipmentRepository.count());

        dashboard.put("availableEquipment",
                equipmentRepository.countByStatus("AVAILABLE"));

        dashboard.put("bookedEquipment",
                equipmentRepository.countByStatus("BOOKED"));

        dashboard.put("underMaintenanceEquipment",
                equipmentRepository.countByStatus("UNDER_MAINTENANCE"));

        return dashboard;
    }

    // Delete Equipment
    public void deleteEquipment(Integer id) {
        equipmentRepository.deleteById(id);
    }

    // Update Equipment
    public Equipment updateEquipment(Integer id, Equipment updatedEquipment) {

        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Equipment not found"));

        equipment.setDepartmentId(updatedEquipment.getDepartmentId());
        equipment.setCategoryId(updatedEquipment.getCategoryId());
        equipment.setEquipmentName(updatedEquipment.getEquipmentName());
        equipment.setModelNo(updatedEquipment.getModelNo());
        equipment.setSerialNo(updatedEquipment.getSerialNo());
        equipment.setDescription(updatedEquipment.getDescription());
        equipment.setPurchaseDate(updatedEquipment.getPurchaseDate());
        equipment.setStatus(updatedEquipment.getStatus());

        return equipmentRepository.save(equipment);
    }
}