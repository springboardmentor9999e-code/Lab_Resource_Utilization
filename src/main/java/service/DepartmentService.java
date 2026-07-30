package com.example.labresourceplatform.service;

import com.example.labresourceplatform.entity.Department;
import com.example.labresourceplatform.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    public Department saveDepartment(Department department) {
        return departmentRepository.save(department);
    }

    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    public Department getDepartmentById(Long id) {
        return departmentRepository.findById(id).orElse(null);
    }

    public Department updateDepartment(Long id, Department department) {

        Department existingDepartment =
                departmentRepository.findById(id).orElse(null);

        if (existingDepartment != null) {

            existingDepartment.setDepartmentName(
                    department.getDepartmentName()
            );

            existingDepartment.setInstitution(
                    department.getInstitution()
            );

            return departmentRepository.save(existingDepartment);
        }

        return null;
    }

    public void deleteDepartment(Long id) {
        departmentRepository.deleteById(id);
    }
}