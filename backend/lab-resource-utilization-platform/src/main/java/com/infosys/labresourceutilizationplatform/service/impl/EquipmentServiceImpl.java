package com.infosys.labresourceutilizationplatform.service.impl;

import com.infosys.labresourceutilizationplatform.entity.Equipment;
import com.infosys.labresourceutilizationplatform.entity.Laboratory;
import com.infosys.labresourceutilizationplatform.repository.EquipmentRepository;
import com.infosys.labresourceutilizationplatform.repository.LaboratoryRepository;
import com.infosys.labresourceutilizationplatform.service.EquipmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EquipmentServiceImpl implements EquipmentService {

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private LaboratoryRepository laboratoryRepository;

    @Override
    public Equipment addEquipment(Equipment equipment) {

        if (equipmentRepository.existsBySerialNumber(equipment.getSerialNumber())) {
            throw new RuntimeException("Equipment with this serial number already exists.");
        }

        if (equipment.getLaboratory() != null) {

            Laboratory laboratory = laboratoryRepository.findById(
                            equipment.getLaboratory().getLabId())
                    .orElseThrow(() -> new RuntimeException("Laboratory not found."));

            equipment.setLaboratory(laboratory);
        }

        return equipmentRepository.save(equipment);
    }

    @Override
    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }

    @Override
    public Equipment getEquipmentById(Long id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found."));
    }

    @Override
    public Equipment updateEquipment(Long id, Equipment equipment) {

        if (equipmentRepository.existsBySerialNumberAndIdNot(equipment.getSerialNumber(), id)) {
            throw new RuntimeException("Equipment with this serial number already exists.");
        }

        Equipment existingEquipment = getEquipmentById(id);

        existingEquipment.setEquipmentName(equipment.getEquipmentName());
        existingEquipment.setCategory(equipment.getCategory());
        existingEquipment.setDescription(equipment.getDescription());
        existingEquipment.setSpecifications(equipment.getSpecifications());
        existingEquipment.setManufacturer(equipment.getManufacturer());
        existingEquipment.setModel(equipment.getModel());
        existingEquipment.setSerialNumber(equipment.getSerialNumber());
        existingEquipment.setPurchaseDate(equipment.getPurchaseDate());
        existingEquipment.setWarrantyExpiryDate(equipment.getWarrantyExpiryDate());
        existingEquipment.setTotalQuantity(equipment.getTotalQuantity());
        existingEquipment.setAvailableQuantity(equipment.getAvailableQuantity());
        existingEquipment.setStatus(equipment.getStatus());
        existingEquipment.setImageUrl(equipment.getImageUrl());
        existingEquipment.setDocumentUrl(equipment.getDocumentUrl());
        existingEquipment.setCostPerHour(equipment.getCostPerHour());

        existingEquipment.setCalibrationFrequency(equipment.getCalibrationFrequency());
        existingEquipment.setLastCalibrationDate(equipment.getLastCalibrationDate());
        existingEquipment.setNextCalibrationDate(equipment.getNextCalibrationDate());
        existingEquipment.setCalibrationStatus(equipment.getCalibrationStatus());

        existingEquipment.setLicenseNumber(equipment.getLicenseNumber());
        existingEquipment.setLicenseIssueDate(equipment.getLicenseIssueDate());
        existingEquipment.setLicenseExpiryDate(equipment.getLicenseExpiryDate());
        existingEquipment.setLicenseRenewalFrequency(equipment.getLicenseRenewalFrequency());
        existingEquipment.setLicenseRenewalDate(equipment.getLicenseRenewalDate());

        existingEquipment.setCertificateNumber(equipment.getCertificateNumber());
        existingEquipment.setCertificateIssueDate(equipment.getCertificateIssueDate());
        existingEquipment.setCertificateExpiryDate(equipment.getCertificateExpiryDate());
        existingEquipment.setCertificateRenewalFrequency(equipment.getCertificateRenewalFrequency());
        existingEquipment.setCertificateRenewalDate(equipment.getCertificateRenewalDate());

        existingEquipment.setLicenseStatus(equipment.getLicenseStatus());
        existingEquipment.setCertificateStatus(equipment.getCertificateStatus());

        if (equipment.getLaboratory() != null) {

            Laboratory laboratory = laboratoryRepository.findById(
                            equipment.getLaboratory().getLabId())
                    .orElseThrow(() -> new RuntimeException("Laboratory not found."));

            existingEquipment.setLaboratory(laboratory);
        }

        return equipmentRepository.save(existingEquipment);
    }

    @Override
    public void deleteEquipment(Long id) {

        Equipment equipment = getEquipmentById(id);

        equipmentRepository.delete(equipment);
    }

    @Override
    public List<Equipment> searchEquipment(String equipmentName) {
        return equipmentRepository.findByEquipmentNameContainingIgnoreCase(equipmentName);
    }

    @Override
    public List<Equipment> getEquipmentByLaboratory(Long laboratoryId) {
        return equipmentRepository.findByLaboratoryLabId(laboratoryId);
    }

    @Override
    public List<Equipment> getEquipmentByCategory(String category) {
        return equipmentRepository.findByCategory(category);
    }

    @Override
    public List<Equipment> getEquipmentByStatus(String status) {
        return equipmentRepository.findByStatus(status);
    }
}