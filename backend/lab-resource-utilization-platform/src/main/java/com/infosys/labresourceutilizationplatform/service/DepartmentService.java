package com.infosys.labresourceutilizationplatform.service;

import com.infosys.labresourceutilizationplatform.entity.Department;

import java.util.List;

public interface DepartmentService {

    Department addDepartment(Department department);

    List<Department> getAllDepartments();

    Department getDepartmentById(Long id);

    List<Department> getDepartmentsByInstitution(Long institutionId);

    Department updateDepartment(Long id, Department department);

    void deleteDepartment(Long id);

}