package com.example.hello.service;

import com.example.hello.entity.Department;
import com.example.hello.repository.DepartmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import org.springframework.data.domain.Sort;
@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    public List<Department> getAllDepartments() {
        return departmentRepository.findAll(Sort.by("departmentId"));
    }

    public Department saveDepartment(Department department) {
        return departmentRepository.save(department);
    }
    public Department getDepartmentById(Integer id) {

        return departmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Department not found"));

    }

    public void deleteDepartment(Integer id) {
        departmentRepository.deleteById(id);
    }

}