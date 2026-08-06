package com.rems.service;

import com.rems.entity.Equipment;
import com.rems.enums.EquipmentStatus;
import com.rems.repository.EquipmentRepository;
import com.rems.dto.LabRequest;
import com.rems.dto.LabResponse;
import com.rems.entity.Department;
import com.rems.entity.Lab;
import com.rems.entity.User;
import com.rems.exception.ApiException;
import com.rems.repository.LabRepository;
import com.rems.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LabService {

    private final LabRepository labRepository;
    private final UserRepository userRepository;
    private final EquipmentRepository equipmentRepository;

    @Transactional
    public LabResponse createLab(LabRequest request, String headEmail) {
        User head = userRepository.findByEmail(headEmail)
                .orElseThrow(() -> new ApiException("Department Head not found", HttpStatus.NOT_FOUND));

        Department department = head.getDepartment();
        if (department == null) {
            throw new ApiException("You are not assigned to any department", HttpStatus.BAD_REQUEST);
        }

        Lab lab = Lab.builder()
                .name(request.getName())
                .department(department)
                .build();

        Lab saved = labRepository.save(lab);
        return toResponse(saved);
    }

    @Transactional
    public void deleteLab(Long labId, String headEmail) {
        User head = userRepository.findByEmail(headEmail)
                .orElseThrow(() -> new ApiException("Department Head not found", HttpStatus.NOT_FOUND));

        Lab lab = labRepository.findById(labId)
                .orElseThrow(() -> new ApiException("Lab not found with ID " + labId, HttpStatus.NOT_FOUND));

        Department department = head.getDepartment();
        if (department == null || !lab.getDepartment().getDepartmentId().equals(department.getDepartmentId())) {
            throw new ApiException("You are not authorized to manage labs for this department", HttpStatus.FORBIDDEN);
        }

        labRepository.delete(lab);
    }

    public List<LabResponse> getMyDepartmentLabs(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        Department department = user.getDepartment();
        if (department == null) {
            throw new ApiException("User is not assigned to any department", HttpStatus.BAD_REQUEST);
        }

        return labRepository.findByDepartment_DepartmentId(department.getDepartmentId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public LabResponse toResponse(Lab lab) {
        if (lab == null) return null;

        List<Equipment> eqList = equipmentRepository.findByLabLabId(lab.getLabId());
        long available = eqList.stream().filter(e -> e.getStatus() == EquipmentStatus.AVAILABLE).count();
        long maintenance = eqList.stream().filter(e -> e.getStatus() == EquipmentStatus.MAINTENANCE).count();
        long booked = eqList.stream().filter(e -> e.getStatus() == EquipmentStatus.BOOKED).count();

        return LabResponse.builder()
                .labId(lab.getLabId())
                .name(lab.getName())
                .departmentId(lab.getDepartment() != null ? lab.getDepartment().getDepartmentId() : null)
                .departmentName(lab.getDepartment() != null ? lab.getDepartment().getName() : null)
                .createdAt(lab.getCreatedAt())
                .updatedAt(lab.getUpdatedAt())
                .availableCount(available)
                .maintenanceCount(maintenance)
                .bookedCount(booked)
                .build();
    }
}
