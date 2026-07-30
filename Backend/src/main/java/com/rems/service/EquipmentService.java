package com.rems.service;

import com.rems.dto.EquipmentRequest;
import com.rems.dto.EquipmentResponse;
import com.rems.dto.RegisterResponse;
import com.rems.entity.Equipment;
import com.rems.entity.User;
import com.rems.enums.EquipmentStatus;
import com.rems.enums.UserStatus;
import com.rems.exception.ApiException;
import com.rems.repository.DepartmentRepository;
import com.rems.repository.EquipmentRepository;
import com.rems.repository.InstitutionRepository;
import com.rems.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rems.entity.Lab;
import com.rems.entity.Department;
import com.rems.repository.LabRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;
import java.util.Collection;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final InstitutionRepository institutionRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final LabRepository labRepository;

    public List<EquipmentResponse> searchEquipment(String name, Long institutionId, Long departmentId, Long labId, String statusStr) {
        EquipmentStatus status = null;
        if (statusStr != null && !statusStr.trim().isEmpty()) {
            try {
                status = EquipmentStatus.fromValue(statusStr);
            } catch (IllegalArgumentException e) {
                throw new ApiException("Invalid equipment status value: " + statusStr, HttpStatus.BAD_REQUEST);
            }
        }

        var auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = auth != null ? auth.getName() : null;
        User user = null;
        if (userEmail != null && !userEmail.equals("anonymousUser")) {
            user = userRepository.findByEmail(userEmail).orElse(null);
        }

        Collection<? extends GrantedAuthority> authorities = auth != null ? auth.getAuthorities() : List.of();
        boolean isSysAdmin = authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_SYSTEM_ADMINISTRATOR"));
        boolean isResearcher = authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_RESEARCHER_STUDENT"));
        boolean isInstAdmin = authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_INSTITUTION_ADMINISTRATOR"));
        boolean isDeptHead = authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_DEPARTMENT_HEAD"));
        boolean isLabManager = authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_LAB_MANAGER"));
        boolean isLabTech = authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_LAB_TECHNICIAN"));

        Long queryInstitutionId = institutionId;
        Long queryDepartmentId = departmentId;
        Long queryLabId = labId;

        if (user != null && !isSysAdmin && !isResearcher) {
            if (isLabManager || isLabTech) {
                queryLabId = user.getLab() != null ? user.getLab().getLabId() : -1L;
                queryDepartmentId = user.getDepartment() != null ? user.getDepartment().getDepartmentId() : -1L;
                queryInstitutionId = user.getInstitution() != null ? user.getInstitution().getInstitutionId() : -1L;
            } else if (isDeptHead) {
                queryDepartmentId = user.getDepartment() != null ? user.getDepartment().getDepartmentId() : -1L;
                queryInstitutionId = user.getInstitution() != null ? user.getInstitution().getInstitutionId() : -1L;
                if (labId != null) {
                    Lab requestedLab = labRepository.findById(labId).orElse(null);
                    if (requestedLab == null || requestedLab.getDepartment() == null ||
                        !requestedLab.getDepartment().getDepartmentId().equals(queryDepartmentId)) {
                        queryLabId = -1L;
                    }
                }
            } else if (isInstAdmin) {
                queryInstitutionId = user.getInstitution() != null ? user.getInstitution().getInstitutionId() : -1L;
                if (departmentId != null) {
                    Department requestedDept = departmentRepository.findById(departmentId).orElse(null);
                    if (requestedDept == null || requestedDept.getInstitution() == null ||
                        !requestedDept.getInstitution().getInstitutionId().equals(queryInstitutionId)) {
                        queryDepartmentId = -1L;
                    }
                }
            }
        }

        return equipmentRepository.searchEquipment(name, queryInstitutionId, queryDepartmentId, queryLabId, status)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public EquipmentResponse getEquipmentById(Long id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ApiException("Equipment not found with id " + id, HttpStatus.NOT_FOUND));
        return toResponse(equipment);
    }

    @Transactional
    public EquipmentResponse createEquipment(EquipmentRequest request, String managerEmail){
        User manager = userRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new ApiException("Manager not found", HttpStatus.NOT_FOUND));

        if (manager.getDepartment() == null) {
            throw new ApiException("Lab Manager is not assigned to any department", HttpStatus.BAD_REQUEST);
        }
        if (manager.getInstitution() == null) {
            throw new ApiException("Lab Manager is not assigned to any institution", HttpStatus.BAD_REQUEST);
        }

        Lab lab = manager.getLab();
        if (request.getLabId() != null) {
            lab = labRepository.findById(request.getLabId())
                    .orElseThrow(() -> new ApiException("Lab not found with id " + request.getLabId(), HttpStatus.BAD_REQUEST));
            if (!lab.getDepartment().getDepartmentId().equals(manager.getDepartment().getDepartmentId())) {
                throw new ApiException("Lab does not belong to your department", HttpStatus.FORBIDDEN);
            }
        }

        Equipment equipment = Equipment.builder()
                .name(request.getName())
                .category(request.getCategory())
                .model(request.getModel())
                .serialNumber(request.getSerialNumber())
                .manufacturer(request.getManufacturer())
                .purchaseCost(request.getPurchaseCost())
                .purchaseDate(request.getPurchaseDate())
                .amount(request.getAmount())
                .imageUrl(request.getImageUrl())
                .cost(request.getCost())
                .location(request.getLocation())
                .department(manager.getDepartment())
                .institution(manager.getInstitution())
                .lab(lab)
                .status(EquipmentStatus.AVAILABLE)   // Available immediately on successful registration
                .description(request.getDescription())
                .manual(request.getManual())
                .build();

        Equipment saved = equipmentRepository.save(equipment);
        return toResponse(saved);
    }

    @Transactional
    public void deleteEquipment(Long id, String managerEmail) {
        User manager = userRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new ApiException("Manager not found", HttpStatus.NOT_FOUND));

        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ApiException("Equipment not found with id " + id, HttpStatus.NOT_FOUND));

        if (manager.getDepartment() == null || equipment.getDepartment() == null ||
            !manager.getDepartment().getDepartmentId().equals(equipment.getDepartment().getDepartmentId())) {
            throw new ApiException("You are not authorized to delete equipment from other departments", HttpStatus.FORBIDDEN);
        }

        equipmentRepository.delete(equipment);
    }

    public EquipmentResponse toResponse(Equipment equipment) {
        if (equipment == null) return null;

        EquipmentResponse.EquipmentResponseBuilder builder = EquipmentResponse.builder()
                .equipmentId(equipment.getEquipmentId())
                .name(equipment.getName())
                .category(equipment.getCategory())
                .model(equipment.getModel())
                .serialNumber(equipment.getSerialNumber())
                .manufacturer(equipment.getManufacturer())
                .purchaseDate(equipment.getPurchaseDate())
                .purchaseCost(equipment.getPurchaseCost())
                .amount(equipment.getAmount())
                .imageUrl(equipment.getImageUrl())
                .cost(equipment.getCost())
                .location(equipment.getLocation())
                .status(equipment.getStatus().getValue())
                .description(equipment.getDescription())
                .manual(equipment.getManual())
                .createdAt(equipment.getCreatedAt())
                .updatedAt(equipment.getUpdatedAt());

        if (equipment.getInstitution() != null) {
            builder.institutionId(equipment.getInstitution().getInstitutionId())
                    .institutionName(equipment.getInstitution().getName());
        }

        if (equipment.getDepartment() != null) {
            builder.departmentId(equipment.getDepartment().getDepartmentId())
                    .departmentName(equipment.getDepartment().getName());
        }

        if (equipment.getLab() != null) {
            builder.labId(equipment.getLab().getLabId())
                    .labName(equipment.getLab().getName());
        }

        return builder.build();
    }
}
