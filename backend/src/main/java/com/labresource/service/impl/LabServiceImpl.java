package com.labresource.service.impl;

import com.labresource.dto.request.LabRequest;
import com.labresource.dto.response.LabResponse;
import com.labresource.entity.Department;
import com.labresource.entity.Institution;
import com.labresource.entity.Lab;
import com.labresource.repository.DepartmentRepository;
import com.labresource.repository.EquipmentRepository;
import com.labresource.repository.InstitutionRepository;
import com.labresource.repository.LabRepository;
import com.labresource.service.interfaces.LabService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LabServiceImpl implements LabService {

    private final LabRepository labRepository;
    private final DepartmentRepository departmentRepository;
    private final InstitutionRepository institutionRepository;
    private final EquipmentRepository equipmentRepository;

    @Override
    @Transactional
    public LabResponse createLab(LabRequest request) {
        if (labRepository.findByCode(request.getCode()).isPresent()) {
            throw new RuntimeException("Lab with this code already exists");
        }

        Department dept = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));

        Institution inst = dept.getInstitution();
        if (inst == null) {
            inst = institutionRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new RuntimeException("No Institution available"));
        }

        Lab lab = Lab.builder()
                .name(request.getName())
                .code(request.getCode())
                .capacity(request.getCapacity())
                .location(request.getLocation())
                .department(dept)
                .institution(inst)
                .isActive(true)
                .build();

        Lab savedLab = labRepository.save(lab);
        return mapToResponse(savedLab);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LabResponse> getAllLabs() {
        return labRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public LabResponse getLabById(Long id) {
        Lab lab = labRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lab not found"));
        return mapToResponse(lab);
    }

    @Override
    @Transactional
    public LabResponse updateLab(Long id, LabRequest request) {
        Lab lab = labRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lab not found"));

        if (!lab.getCode().equals(request.getCode()) && labRepository.findByCode(request.getCode()).isPresent()) {
            throw new RuntimeException("Lab with this code already exists");
        }

        Department dept = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));

        lab.setName(request.getName());
        lab.setCode(request.getCode());
        lab.setCapacity(request.getCapacity());
        lab.setLocation(request.getLocation());
        lab.setDepartment(dept);

        Lab updatedLab = labRepository.save(lab);
        return mapToResponse(updatedLab);
    }

    @Override
    @Transactional
    public void deleteLab(Long id) {
        Lab lab = labRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lab not found"));
        labRepository.delete(lab);
    }

    private LabResponse mapToResponse(Lab lab) {
        long eqCount = equipmentRepository.countByLabId(lab.getLabId());
        
        return LabResponse.builder()
                .labId(lab.getLabId())
                .name(lab.getName())
                .code(lab.getCode())
                .capacity(lab.getCapacity())
                .location(lab.getLocation())
                .departmentId(lab.getDepartment().getDepartmentId())
                .departmentName(lab.getDepartment().getName())
                .equipmentCount(eqCount)
                .isActive(lab.getIsActive())
                .build();
    }
}
