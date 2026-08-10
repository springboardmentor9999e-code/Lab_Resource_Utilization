package com.example.backend.service.impl;

import com.example.backend.entity.Equipment;
import com.example.backend.repository.EquipmentRepository;
import com.example.backend.service.EquipmentService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EquipmentServiceImpl implements EquipmentService {

    private final EquipmentRepository equipmentRepository;

    public EquipmentServiceImpl(EquipmentRepository equipmentRepository) {
        this.equipmentRepository = equipmentRepository;
    }

    @Override
    public Equipment saveEquipment(Equipment equipment) {
        return equipmentRepository.save(equipment);
    }

    @Override
    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }

    @Override
    public Equipment getEquipmentById(Integer id) {
        return equipmentRepository.findById(id).orElse(null);
    }

    @Override
    public Equipment updateEquipment(Equipment equipment) {

        Equipment existingEquipment = equipmentRepository
                .findById(equipment.getId())
                .orElse(null);

        if (existingEquipment == null) {
            return null;
        }

        existingEquipment.setEquipmentName(equipment.getEquipmentName());
        existingEquipment.setCategory(equipment.getCategory());
        existingEquipment.setDescription(equipment.getDescription());
        existingEquipment.setStatus(equipment.getStatus());
        existingEquipment.setQuantity(equipment.getQuantity());
        existingEquipment.setAvailableQuantity(equipment.getAvailableQuantity());
        existingEquipment.setInstitutionId(equipment.getInstitutionId());
        existingEquipment.setLaboratoryId(equipment.getLaboratoryId());
        existingEquipment.setImage(equipment.getImage());
        existingEquipment.setDocumentUrl(equipment.getDocumentUrl());

        return equipmentRepository.save(existingEquipment);
    }

    @Override
    public void deleteEquipment(Integer id) {
        equipmentRepository.deleteById(id);
    }
}