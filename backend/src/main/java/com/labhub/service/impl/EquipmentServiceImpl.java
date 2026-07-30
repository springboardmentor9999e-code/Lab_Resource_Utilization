package com.labhub.service.impl;

import com.labhub.dto.equipment.EquipmentRequest;
import com.labhub.dto.equipment.EquipmentResponse;
import com.labhub.entity.Department;
import com.labhub.entity.Equipment;
import com.labhub.entity.EquipmentCategory;
import com.labhub.enums.EquipmentStatus;
import com.labhub.exception.DuplicateResourceException;
import com.labhub.exception.ResourceNotFoundException;
import com.labhub.repository.DepartmentRepository;
import com.labhub.repository.EquipmentCategoryRepository;
import com.labhub.repository.EquipmentRepository;
import com.labhub.repository.UserRepository;
import com.labhub.entity.User;
import com.labhub.service.EquipmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Equipment service implementation with full CRUD and search/filter support.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EquipmentServiceImpl implements EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final EquipmentCategoryRepository categoryRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public EquipmentResponse create(EquipmentRequest request) {
        // Check serial number uniqueness
        if (request.getSerialNumber() != null && !request.getSerialNumber().isBlank()
                && equipmentRepository.existsBySerialNumber(request.getSerialNumber())) {
            throw new DuplicateResourceException("Equipment with serial number already exists: " + request.getSerialNumber());
        }

        Equipment equipment = buildEquipment(new Equipment(), request);
        equipment.setIsActive(true);
        equipment = equipmentRepository.save(equipment);
        log.info("Created equipment: {} ({})", equipment.getName(), equipment.getId());
        return toResponse(equipment);
    }

    @Override
    @Transactional
    public EquipmentResponse update(UUID id, EquipmentRequest request) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment", "id", id));

        // Check serial number uniqueness (excluding current)
        if (request.getSerialNumber() != null && !request.getSerialNumber().isBlank()) {
            Equipment existing = equipmentRepository.findBySerialNumber(request.getSerialNumber()).orElse(null);
            if (existing != null && !existing.getId().equals(id)) {
                throw new DuplicateResourceException("Serial number already in use: " + request.getSerialNumber());
            }
        }

        equipment = buildEquipment(equipment, request);
        equipment = equipmentRepository.save(equipment);
        log.info("Updated equipment: {}", equipment.getId());
        return toResponse(equipment);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment", "id", id));
        equipment.setIsActive(false);
        equipment.setStatus(EquipmentStatus.RETIRED);
        equipmentRepository.save(equipment);
        log.info("Soft-deleted equipment: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public EquipmentResponse getById(UUID id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment", "id", id));
        return toResponse(equipment);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EquipmentResponse> getAll(String search, UUID categoryId, EquipmentStatus status,
                                           UUID departmentId, Pageable pageable) {
        String searchTerm = (search != null && !search.isBlank()) ? search.trim() : null;

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UUID institutionId = null;
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            String email = auth.getName();
            User currentUser = userRepository.findByEmail(email).orElse(null);
            if (currentUser != null) {
                boolean isSysAdmin = currentUser.getRoles().stream()
                        .anyMatch(r -> r.getName() == com.labhub.enums.RoleName.SYSTEM_ADMIN);
                if (!isSysAdmin) {
                    if (currentUser.getInstitution() != null) {
                        institutionId = currentUser.getInstitution().getId();
                    } else if (currentUser.getDepartment() != null && currentUser.getDepartment().getInstitution() != null) {
                        institutionId = currentUser.getDepartment().getInstitution().getId();
                    }
                }
            }
        }

        if (status == null) {
            return equipmentRepository.findWithFiltersNoStatus(searchTerm, categoryId, departmentId, institutionId, pageable)
                    .map(this::toResponse);
        } else {
            return equipmentRepository.findWithFiltersWithStatus(searchTerm, categoryId, status, departmentId, institutionId, pageable)
                    .map(this::toResponse);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipmentResponse> getAllCategories() {
        // Returns equipment list — categories are returned separately via category endpoint
        return equipmentRepository.findAll().stream()
                .filter(e -> Boolean.TRUE.equals(e.getIsActive()))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private Equipment buildEquipment(Equipment equipment, EquipmentRequest request) {
        equipment.setName(request.getName());
        equipment.setSerialNumber(request.getSerialNumber());
        equipment.setManufacturer(request.getManufacturer());
        equipment.setModel(request.getModel());
        equipment.setPurchaseDate(request.getPurchaseDate());
        equipment.setLocation(request.getLocation());
        equipment.setDescription(request.getDescription());
        equipment.setImageUrl(request.getImageUrl());
        equipment.setStatus(request.getStatus() != null ? request.getStatus() : EquipmentStatus.AVAILABLE);

        if (request.getCategoryId() != null) {
            EquipmentCategory category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            equipment.setCategory(category);
        }

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));
            equipment.setDepartment(department);
        }

        return equipment;
    }

    public EquipmentResponse toResponse(Equipment e) {
        return EquipmentResponse.builder()
                .id(e.getId())
                .name(e.getName())
                .serialNumber(e.getSerialNumber())
                .manufacturer(e.getManufacturer())
                .model(e.getModel())
                .purchaseDate(e.getPurchaseDate())
                .location(e.getLocation())
                .description(e.getDescription())
                .imageUrl(e.getImageUrl())
                .status(e.getStatus())
                .categoryId(e.getCategory() != null ? e.getCategory().getId() : null)
                .categoryName(e.getCategory() != null ? e.getCategory().getName() : null)
                .departmentId(e.getDepartment() != null ? e.getDepartment().getId() : null)
                .departmentName(e.getDepartment() != null ? e.getDepartment().getName() : null)
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .isActive(e.getIsActive())
                .build();
    }
}
