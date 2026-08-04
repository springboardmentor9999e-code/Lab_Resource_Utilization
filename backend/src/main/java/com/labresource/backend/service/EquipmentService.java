package com.labresource.backend.service;

import com.labresource.backend.entity.Equipment;
import com.labresource.backend.repository.EquipmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;

    public EquipmentService(EquipmentRepository equipmentRepository) {
        this.equipmentRepository = equipmentRepository;
    }

    // Create Equipment
    public Equipment createEquipment(Equipment equipment) {
        return equipmentRepository.save(equipment);
    }

    // Get All Equipment
    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }

    // Get Equipment By ID
    public Equipment getEquipmentById(Long id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Equipment not found"));
    }

    // Update Equipment
    // Update Equipment
    public Equipment updateEquipment(Long id, Equipment equipment) {

        Equipment existingEquipment = getEquipmentById(id);

        existingEquipment.setEquipmentName(equipment.getEquipmentName());
        existingEquipment.setCategory(equipment.getCategory());
        existingEquipment.setDescription(equipment.getDescription());
        existingEquipment.setCost(equipment.getCost());
        existingEquipment.setQuantity(equipment.getQuantity());
        existingEquipment.setAvailableQuantity(equipment.getAvailableQuantity());
        existingEquipment.setStatus(equipment.getStatus());
        existingEquipment.setImage(equipment.getImage());
        existingEquipment.setLaboratory(equipment.getLaboratory());

    return equipmentRepository.save(existingEquipment);
    }

        public Equipment updateEquipmentByInstitution(
        Long institutionId,
        Long equipmentId,
        Equipment equipment) {

    Equipment existing = equipmentRepository.findById(equipmentId)
            .orElseThrow(() -> new RuntimeException("Equipment not found"));

    if (!existing.getLaboratory()
            .getInstitution()
            .getInstitutionId()
            .equals(institutionId)) {

        throw new RuntimeException("Access Denied");
    }

    existing.setEquipmentName(equipment.getEquipmentName());
    existing.setCategory(equipment.getCategory());
    existing.setDescription(equipment.getDescription());
    existing.setCost(equipment.getCost());
    existing.setQuantity(equipment.getQuantity());
    existing.setAvailableQuantity(equipment.getAvailableQuantity());
    existing.setStatus(equipment.getStatus());
    existing.setImage(equipment.getImage());
    existing.setLaboratory(equipment.getLaboratory());

    return equipmentRepository.save(existing);
}

    public void deleteEquipmentByInstitution(
        Long institutionId,
        Long equipmentId) {

    Equipment equipment = equipmentRepository.findById(equipmentId)
            .orElseThrow(() -> new RuntimeException("Equipment not found"));

    if (!equipment.getLaboratory()
            .getInstitution()
            .getInstitutionId()
            .equals(institutionId)) {

        throw new RuntimeException("Access Denied");
    }

    equipmentRepository.delete(equipment);
}

    // Delete Equipment
    public void deleteEquipment(Long id) {
        equipmentRepository.deleteById(id);
    }
    public List<Equipment> getEquipmentByLab(Long labId) {

    return equipmentRepository.findByLaboratoryLabId(labId);

    }

    public List<Equipment> getEquipmentByInstitution(Long institutionId) {

    return equipmentRepository
            .findByLaboratoryInstitutionInstitutionId(institutionId);
    }
}