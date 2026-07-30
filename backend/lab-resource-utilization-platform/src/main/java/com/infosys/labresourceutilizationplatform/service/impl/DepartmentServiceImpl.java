package com.infosys.labresourceutilizationplatform.service.impl;

import com.infosys.labresourceutilizationplatform.entity.Department;
import com.infosys.labresourceutilizationplatform.entity.Institution;
import com.infosys.labresourceutilizationplatform.repository.DepartmentRepository;
import com.infosys.labresourceutilizationplatform.repository.InstitutionRepository;
import com.infosys.labresourceutilizationplatform.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentServiceImpl implements DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private InstitutionRepository institutionRepository;

    @Override
    public Department addDepartment(Department department) {

        Institution institution = institutionRepository.findById(
                department.getInstitution().getInstitutionId()
        ).orElseThrow(() -> new RuntimeException("Institution not found"));

        department.setInstitution(institution);

        return departmentRepository.save(department);
    }

    @Override
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    @Override
    public Department getDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found"));
    }

    @Override
    public List<Department> getDepartmentsByInstitution(Long institutionId) {
        return departmentRepository.findByInstitutionInstitutionId(institutionId);
    }

    @Override
    public Department updateDepartment(Long id, Department department) {

        Department existingDepartment = getDepartmentById(id);

        Institution institution = institutionRepository.findById(
                department.getInstitution().getInstitutionId()
        ).orElseThrow(() -> new RuntimeException("Institution not found"));

        existingDepartment.setDepartmentName(department.getDepartmentName());
        existingDepartment.setDepartmentCode(department.getDepartmentCode());
        existingDepartment.setInstitution(institution);
        existingDepartment.setHodName(department.getHodName());
        existingDepartment.setContactEmail(department.getContactEmail());
        existingDepartment.setContactPhone(department.getContactPhone());
        existingDepartment.setStatus(department.getStatus());

        return departmentRepository.save(existingDepartment);
    }

    @Override
    public void deleteDepartment(Long id) {

        Department department = getDepartmentById(id);

        departmentRepository.delete(department);
    }
}