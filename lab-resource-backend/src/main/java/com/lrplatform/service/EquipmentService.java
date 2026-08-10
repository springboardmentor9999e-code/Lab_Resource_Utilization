package com.lrplatform.service;

import com.lrplatform.annotation.Auditable;
import com.lrplatform.exception.BadRequestException;
import com.lrplatform.exception.DuplicateResourceException;
import com.lrplatform.exception.ResourceNotFoundException;
import com.lrplatform.model.entity.Equipment;
import com.lrplatform.model.entity.EquipmentTag;
import com.lrplatform.model.enums.EquipmentStatus;
import com.lrplatform.repository.BookingRepository;
import com.lrplatform.repository.EquipmentRepository;
import com.lrplatform.repository.EquipmentTagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final EquipmentTagRepository equipmentTagRepository;
    private final BookingRepository bookingRepository;

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
        if (equipment.getTags() != null && !equipment.getTags().isEmpty()) {
            equipment.setTags(getOrCreateTags(equipment.getTags()));
        }
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
        equipment.setHourlyRate(updated.getHourlyRate());
        equipment.setWarrantyExpiry(updated.getWarrantyExpiry());
        equipment.setDescription(updated.getDescription());
        equipment.setMaxBookingHours(updated.getMaxBookingHours());
        equipment.setCategory(updated.getCategory());
        equipment.setLaboratory(updated.getLaboratory());
        equipment.setSpecifications(updated.getSpecifications());
        if (updated.getServiceIntervalMonths() != null) {
            equipment.setServiceIntervalMonths(updated.getServiceIntervalMonths());
            if (equipment.getLastServiceDate() != null) {
                equipment.setNextServiceDueDate(equipment.getLastServiceDate().plusMonths(updated.getServiceIntervalMonths()));
            }
        }
        if (updated.getCalibrationIntervalMonths() != null) {
            equipment.setCalibrationIntervalMonths(updated.getCalibrationIntervalMonths());
        }
        if (updated.getTags() != null) {
            equipment.setTags(getOrCreateTags(updated.getTags()));
        }
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
        validateImageFile(file);
        Equipment equipment = getEquipmentById(id);

        Path equipmentDir = Paths.get(uploadDir, "equipment").toAbsolutePath().normalize();
        if (!equipmentDir.toFile().exists()) {
            equipmentDir.toFile().mkdirs();
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase(Locale.ROOT);
        }
        String filename = "equipment_" + id + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;
        Path filePath = equipmentDir.resolve(filename);
        file.transferTo(filePath.toFile());

        equipment.setImageUrl("/uploads/equipment/" + filename);
        log.info("Image uploaded for equipment {}: {}", id, filename);
        return equipmentRepository.save(equipment);
    }

    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        String extension = "";
        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase(Locale.ROOT);
        }

        if (!ALLOWED_IMAGE_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("Unsupported file type. Allowed extensions: .jpg, .jpeg, .png, .gif, .webp");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
            throw new BadRequestException("Unsupported content type. Only image files are allowed");
        }
    }

    private static final Set<String> ALLOWED_IMAGE_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".gif", ".webp");

    @Transactional(readOnly = true)
    public List<EquipmentTag> searchTags(String query) {
        if (query == null || query.isBlank()) {
            return equipmentTagRepository.findAll();
        }
        return equipmentTagRepository.searchByTagName(query);
    }

    @Transactional
    public List<EquipmentTag> getOrCreateTags(List<EquipmentTag> inputTags) {
        List<EquipmentTag> resolved = new ArrayList<>();
        for (EquipmentTag input : inputTags) {
            String name = input.getTagName() != null ? input.getTagName().trim() : "";
            if (name.isEmpty()) continue;
            EquipmentTag existing = equipmentTagRepository.findByTagNameIgnoreCase(name).orElse(null);
            if (existing != null) {
                resolved.add(existing);
            } else {
                EquipmentTag newTag = EquipmentTag.builder().tagName(name).build();
                resolved.add(equipmentTagRepository.save(newTag));
            }
        }
        return resolved;
    }

    @Transactional(readOnly = true)
    public List<Equipment> getRecommendations(Long userId) {
        List<Long> userCategoryIds = bookingRepository.findTopCategoryIdsByUserId(userId, 3);
        if (!userCategoryIds.isEmpty()) {
            List<Equipment> recommended = equipmentRepository.findUnbookedByUserAndCategories(userId, userCategoryIds);
            if (!recommended.isEmpty()) {
                return recommended.stream().limit(5).toList();
            }
        }
        return equipmentRepository.findMostBookedEquipment(5);
    }
}
