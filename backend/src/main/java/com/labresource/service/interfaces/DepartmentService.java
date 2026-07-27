package com.labresource.service.interfaces;

import com.labresource.entity.Department;

import java.util.List;

public interface DepartmentService {
    
    Department createDepartment(Department department);
    
    List<Department> getAllDepartments();
    
    Department getDepartmentById(Long id);
    
}