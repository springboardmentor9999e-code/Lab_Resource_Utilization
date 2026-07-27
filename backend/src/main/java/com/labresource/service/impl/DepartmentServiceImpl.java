package com.labresource.service.impl;

import com.labresource.entity.Department;
import com.labresource.repository.DepartmentRepository;
import com.labresource.service.interfaces.DepartmentService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentServiceImpl implements DepartmentService {
    
    private final DepartmentRepository departmentRepository;
    
    public DepartmentServiceImpl(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }
    
    @Override
    public Department createDepartment(Department department) {
        return departmentRepository.save(department);
    }
    
    @Override
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }
    
    @Override
    public Department getDepartmentById(Long id) {
        return departmentRepository.findById(id).orElse(null);
    }
}