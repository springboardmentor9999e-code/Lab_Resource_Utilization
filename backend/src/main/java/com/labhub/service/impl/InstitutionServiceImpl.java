package com.labhub.service.impl;

import com.labhub.dto.institution.DepartmentDTO;
import com.labhub.dto.institution.InstitutionDTO;
import com.labhub.entity.Department;
import com.labhub.entity.Institution;
import com.labhub.enums.InstitutionStatus;
import com.labhub.enums.UserStatus;
import com.labhub.exception.ResourceNotFoundException;
import com.labhub.repository.DepartmentRepository;
import com.labhub.repository.InstitutionRepository;
import com.labhub.repository.UserRepository;
import com.labhub.service.InstitutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InstitutionServiceImpl implements InstitutionService {

    private final InstitutionRepository institutionRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<InstitutionDTO> getAllInstitutions() {
        return institutionRepository.findAll().stream()
                .filter(i -> Boolean.TRUE.equals(i.getIsActive()) || i.getIsActive() == null)
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InstitutionDTO> getApprovedInstitutions() {
        return institutionRepository.findAll().stream()
                .filter(i -> (Boolean.TRUE.equals(i.getIsActive()) || i.getIsActive() == null) &&
                        (i.getStatus() == null || i.getStatus() == InstitutionStatus.APPROVED))
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DepartmentDTO> getDepartmentsByInstitution(UUID institutionId) {
        return departmentRepository.findByInstitutionId(institutionId).stream()
                .filter(d -> Boolean.TRUE.equals(d.getIsActive()) || d.getIsActive() == null)
                .map(d -> DepartmentDTO.builder()
                        .id(d.getId())
                        .name(d.getName())
                        .description(d.getDescription())
                        .institutionId(d.getInstitution().getId())
                        .institutionName(d.getInstitution().getName())
                        .build())
                .toList();
    }

    @Override
    @Transactional
    public InstitutionDTO updateInstitutionStatus(UUID id, InstitutionStatus status) {
        Institution inst = institutionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Institution", "id", id));
        inst.setStatus(status);
        inst = institutionRepository.save(inst);

        if (status == InstitutionStatus.APPROVED) {
            userRepository.findByInstitutionId(id).forEach(u -> {
                if (u.getStatus() == UserStatus.PENDING_APPROVAL) {
                    u.setStatus(UserStatus.ACTIVE);
                    userRepository.save(u);
                }
            });
        }

        return mapToDTO(inst);
    }

    @Override
    @Transactional
    public DepartmentDTO createDepartment(UUID institutionId, String name, String description) {
        Institution inst = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Institution", "id", institutionId));
        Department dept = Department.builder()
                .name(name)
                .description(description)
                .institution(inst)
                .isActive(true)
                .build();
        dept = departmentRepository.save(dept);
        return DepartmentDTO.builder()
                .id(dept.getId())
                .name(dept.getName())
                .description(dept.getDescription())
                .institutionId(inst.getId())
                .institutionName(inst.getName())
                .build();
    }

    private InstitutionDTO mapToDTO(Institution i) {
        int deptCount = 0;
        try {
            if (i.getDepartments() != null) {
                deptCount = i.getDepartments().size();
            }
        } catch (Exception ignored) {
            // Guard against lazy collection initialization
        }
        return InstitutionDTO.builder()
                .id(i.getId())
                .name(i.getName())
                .code(i.getCode())
                .type(i.getType())
                .status(i.getStatus() != null ? i.getStatus().name() : "APPROVED")
                .address(i.getAddress())
                .email(i.getEmail())
                .phone(i.getPhone())
                .website(i.getWebsite())
                .logoUrl(i.getLogoUrl())
                .primaryAdminName(i.getPrimaryAdminName())
                .primaryAdminEmail(i.getPrimaryAdminEmail())
                .departmentCount(deptCount)
                .build();
    }
}

