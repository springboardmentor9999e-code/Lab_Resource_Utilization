package com.infosys.labresourceutilizationplatform.service.impl;

import com.infosys.labresourceutilizationplatform.entity.Equipment;
import com.infosys.labresourceutilizationplatform.entity.Laboratory;
import com.infosys.labresourceutilizationplatform.entity.ResourceSharing;
import com.infosys.labresourceutilizationplatform.entity.User;
import com.infosys.labresourceutilizationplatform.repository.EquipmentRepository;
import com.infosys.labresourceutilizationplatform.repository.LaboratoryRepository;
import com.infosys.labresourceutilizationplatform.repository.ResourceSharingRepository;
import com.infosys.labresourceutilizationplatform.repository.UserRepository;
import com.infosys.labresourceutilizationplatform.service.EquipmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class EquipmentServiceImpl implements EquipmentService {

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private LaboratoryRepository laboratoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ResourceSharingRepository resourceSharingRepository;

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

        if (equipment.getCostPerHour() == null || equipment.getCostPerHour() <= 0) {
            equipment.setCostPerHour(5.0); // Default external rate ₹5/hr
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
        existingEquipment.setCostPerHour(equipment.getCostPerHour() != null ? equipment.getCostPerHour() : 5.0);

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

    @Override
    public List<Equipment> getEquipmentForUser(String userEmail, Long laboratoryId, String category, String status, String search, String ownershipFilter) {
        User user = (userEmail != null) ? userRepository.findByEmail(userEmail).orElse(null) : null;
        Long userInstId = (user != null && user.getInstitutionId() != null) ? Long.valueOf(user.getInstitutionId()) : null;
        String role = (user != null && user.getRole() != null) ? user.getRole().getRoleName() : "STUDENT";

        List<Equipment> result = new ArrayList<>();

        if ("SYSTEM_ADMIN".equalsIgnoreCase(role)) {
            result.addAll(equipmentRepository.findAll());
        } else if (userInstId != null) {
            // 1. Owned by user's institution
            List<Equipment> ownedEquipment = equipmentRepository.findAll().stream().filter(eq -> {
                if (eq.getLaboratory() != null &&
                    eq.getLaboratory().getDepartment() != null &&
                    eq.getLaboratory().getDepartment().getInstitution() != null) {
                    return userInstId.equals(eq.getLaboratory().getDepartment().getInstitution().getInstitutionId());
                }
                return false;
            }).collect(Collectors.toList());

            // 2. Actively / Approved Shared TO user's institution
            List<ResourceSharing> activeSharings = resourceSharingRepository
                    .findBySharedWithInstitutionInstitutionIdAndStatusIn(userInstId, List.of("Approved", "Active"));

            List<Equipment> sharedEquipment = activeSharings.stream()
                    .map(ResourceSharing::getEquipment)
                    .filter(Objects::nonNull)
                    .distinct()
                    .collect(Collectors.toList());

            if ("OWNED".equalsIgnoreCase(ownershipFilter)) {
                result.addAll(ownedEquipment);
            } else if ("SHARED".equalsIgnoreCase(ownershipFilter)) {
                result.addAll(sharedEquipment);
            } else {
                // Combine without duplicates
                Set<Long> addedIds = new HashSet<>();
                for (Equipment eq : ownedEquipment) {
                    if (addedIds.add(eq.getId())) {
                        result.add(eq);
                    }
                }
                for (Equipment eq : sharedEquipment) {
                    if (addedIds.add(eq.getId())) {
                        result.add(eq);
                    }
                }
            }
        } else {
            result.addAll(equipmentRepository.findAll());
        }

        // Apply additional filters
        return result.stream().filter(eq -> {
            if (laboratoryId != null && (eq.getLaboratory() == null || !laboratoryId.equals(eq.getLaboratory().getLabId()))) {
                return false;
            }
            if (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase(eq.getCategory())) {
                return false;
            }
            if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase(eq.getStatus())) {
                return false;
            }
            if (search != null && !search.trim().isEmpty()) {
                String q = search.toLowerCase();
                boolean matchName = eq.getEquipmentName() != null && eq.getEquipmentName().toLowerCase().contains(q);
                boolean matchSerial = eq.getSerialNumber() != null && eq.getSerialNumber().toLowerCase().contains(q);
                boolean matchCat = eq.getCategory() != null && eq.getCategory().toLowerCase().contains(q);
                if (!matchName && !matchSerial && !matchCat) {
                    return false;
                }
            }
            return true;
        }).collect(Collectors.toList());
    }

    @Override
    public List<Equipment> getGlobalEquipmentView(Long institutionId, Long departmentId, Long laboratoryId, String ownership, String sharedStatus, String status, String search) {
        List<Equipment> all = equipmentRepository.findAll();

        return all.stream().filter(eq -> {
            if (eq.getLaboratory() == null ||
                eq.getLaboratory().getDepartment() == null ||
                eq.getLaboratory().getDepartment().getInstitution() == null) {
                return false;
            }

            Long eqInstId = eq.getLaboratory().getDepartment().getInstitution().getInstitutionId();
            Long eqDeptId = eq.getLaboratory().getDepartment().getDepartmentId();
            Long eqLabId = eq.getLaboratory().getLabId();

            if (institutionId != null && !institutionId.equals(eqInstId)) {
                return false;
            }
            if (departmentId != null && !departmentId.equals(eqDeptId)) {
                return false;
            }
            if (laboratoryId != null && !laboratoryId.equals(eqLabId)) {
                return false;
            }
            if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL") && !status.equalsIgnoreCase(eq.getStatus())) {
                return false;
            }
            if (search != null && !search.trim().isEmpty()) {
                String q = search.toLowerCase();
                boolean matchName = eq.getEquipmentName() != null && eq.getEquipmentName().toLowerCase().contains(q);
                boolean matchSerial = eq.getSerialNumber() != null && eq.getSerialNumber().toLowerCase().contains(q);
                boolean matchCat = eq.getCategory() != null && eq.getCategory().toLowerCase().contains(q);
                if (!matchName && !matchSerial && !matchCat) {
                    return false;
                }
            }

            // Shared status filter
            if (sharedStatus != null && !sharedStatus.trim().isEmpty() && !sharedStatus.equalsIgnoreCase("ALL")) {
                List<ResourceSharing> sharings = resourceSharingRepository.findByEquipmentIdAndStatusIn(eq.getId(), List.of("Approved", "Active"));
                boolean isShared = !sharings.isEmpty();
                if ("SHARED".equalsIgnoreCase(sharedStatus) && !isShared) return false;
                if ("NOT_SHARED".equalsIgnoreCase(sharedStatus) && isShared) return false;
            }

            return true;
        }).collect(Collectors.toList());
    }

    @Override
    public Equipment updateEquipmentCost(Long id, Double costPerHour) {
        Equipment eq = getEquipmentById(id);
        eq.setCostPerHour(costPerHour != null && costPerHour >= 0 ? costPerHour : 5.0);
        return equipmentRepository.save(eq);
    }
}