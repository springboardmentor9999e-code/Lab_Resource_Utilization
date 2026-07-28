package com.lrplatform.service;

import com.lrplatform.annotation.Auditable;
import com.lrplatform.exception.DuplicateResourceException;
import com.lrplatform.exception.ResourceNotFoundException;
import com.lrplatform.model.entity.Equipment;
import com.lrplatform.model.enums.EquipmentStatus;
import com.lrplatform.repository.EquipmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;

    @Value("${storage.local.upload-dir:./uploads}")
    private String uploadDir;

    @Transactional(readOnly = true)
    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Equipment> getEquipmentByDepartmentId(Long departmentId) {
        return equipmentRepository.findByLaboratoryDepartmentId(departmentId);
    }

    @Transactional(readOnly = true)
    public List<Equipment> getEquipmentByInstitutionId(Long institutionId) {
        return equipmentRepository.findByLaboratoryDepartmentInstitutionId(institutionId);
    }

    @Transactional(readOnly = true)
    public Equipment getEquipmentById(Long id) {
        return equipmentRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with id: " + id));
    }

    @Auditable(module = "EQUIPMENT", action = "CREATE", entityType = "Equipment")
    @Transactional
    public Equipment createEquipment(Equipment equipment) {
        if (equipmentRepository.existsByEquipmentCode(equipment.getEquipmentCode())) {
            throw new DuplicateResourceException("Equipment code already exists: " + equipment.getEquipmentCode());
        }
        equipment.setStatus(EquipmentStatus.AVAILABLE);
        return equipmentRepository.save(equipment);
    }

    @Auditable(module = "EQUIPMENT", action = "UPDATE", entityType = "Equipment")
    @Transactional
    public Equipment updateEquipment(Long id, Equipment updated) {
        Equipment equipment = getEquipmentById(id);
        equipment.setEquipmentName(updated.getEquipmentName());
        equipment.setManufacturer(updated.getManufacturer());
        equipment.setModelNumber(updated.getModelNumber());
        equipment.setSerialNumber(updated.getSerialNumber());
        equipment.setPurchaseDate(updated.getPurchaseDate());
        equipment.setPurchaseCost(updated.getPurchaseCost());
        equipment.setWarrantyExpiry(updated.getWarrantyExpiry());
        equipment.setDescription(updated.getDescription());
        equipment.setMaxBookingHours(updated.getMaxBookingHours());
        equipment.setCategory(updated.getCategory());
        equipment.setLaboratory(updated.getLaboratory());
        return equipmentRepository.save(equipment);
    }

    @Auditable(module = "EQUIPMENT", action = "DELETE", entityType = "Equipment")
    @Transactional
    public void deleteEquipment(Long id) {
        Equipment equipment = getEquipmentById(id);
        equipmentRepository.delete(Objects.requireNonNull(equipment));
    }

    @Transactional
    public Equipment updateStatus(Long id, EquipmentStatus status) {
        Equipment equipment = getEquipmentById(id);
        equipment.setStatus(status);
        return equipmentRepository.save(equipment);
    }

    @Transactional(readOnly = true)
    public List<Equipment> searchEquipment(String name, Long categoryId, Long laboratoryId, String status) {
        return equipmentRepository.searchEquipment(name, categoryId, laboratoryId, status);
    }

    @SuppressWarnings("null")
    @Transactional
    public Equipment uploadImage(Long id, MultipartFile file) throws IOException {
        Equipment equipment = getEquipmentById(id);

        Path equipmentDir = Paths.get(uploadDir, "equipment").toAbsolutePath().normalize();
        if (!equipmentDir.toFile().exists()) {
            equipmentDir.toFile().mkdirs();
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = "equipment_" + id + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;
        Path filePath = equipmentDir.resolve(filename);
        file.transferTo(filePath.toFile());

        equipment.setImageUrl("/uploads/equipment/" + filename);
        log.info("Image uploaded for equipment {}: {}", id, filename);
        return equipmentRepository.save(equipment);
    }
}
