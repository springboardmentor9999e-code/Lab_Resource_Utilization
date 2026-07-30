package com.rems.service;

import com.rems.dto.DepartmentRequest;
import com.rems.dto.DepartmentResponse;
import com.rems.entity.Department;
import com.rems.entity.Institution;
import com.rems.entity.User;
import com.rems.exception.ApiException;
import com.rems.repository.DepartmentRepository;
import com.rems.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    @Transactional
    public DepartmentResponse createDepartment(DepartmentRequest request, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ApiException("Institution Administrator not found", HttpStatus.NOT_FOUND));

        Institution institution = admin.getInstitution();
        if (institution == null) {
            throw new ApiException("You are not assigned to any institution", HttpStatus.BAD_REQUEST);
        }

        Department department = Department.builder()
                .name(request.getName())
                .institution(institution)
                .build();

        Department saved = departmentRepository.save(department);
        return toResponse(saved);
    }

    @Transactional
    public void deleteDepartment(Long id, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ApiException("Institution Administrator not found", HttpStatus.NOT_FOUND));

        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ApiException("Department not found with ID " + id, HttpStatus.NOT_FOUND));

        Institution institution = admin.getInstitution();
        if (institution == null || !department.getInstitution().getInstitutionId().equals(institution.getInstitutionId())) {
            throw new ApiException("You are not authorized to delete departments for this institution", HttpStatus.FORBIDDEN);
        }

        departmentRepository.delete(department);
    }

    public List<DepartmentResponse> getMyInstitutionDepartments(String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        Institution institution = admin.getInstitution();
        if (institution == null) {
            throw new ApiException("User is not assigned to any institution", HttpStatus.BAD_REQUEST);
        }

        return departmentRepository.findByInstitution_InstitutionId(institution.getInstitutionId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public DepartmentResponse toResponse(Department department) {
        if (department == null) return null;
        return DepartmentResponse.builder()
                .departmentId(department.getDepartmentId())
                .name(department.getName())
                .institutionId(department.getInstitution().getInstitutionId())
                .institutionName(department.getInstitution().getName())
                .createdAt(department.getCreatedAt())
                .build();
    }
}
