package com.example.hello.service;

import com.example.hello.entity.Department;
import com.example.hello.repository.DepartmentRepository;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentService(
            DepartmentRepository departmentRepository) {

        this.departmentRepository = departmentRepository;
    }


    // ============================================================
    // GET ALL DEPARTMENTS
    // ============================================================

    public List<Department> getAllDepartments() {

        return departmentRepository.findAll(
                Sort.by("departmentId")
        );
    }


    // ============================================================
    // GET DEPARTMENTS BY INSTITUTION
    // ============================================================

    public List<Department> getDepartmentsByInstitution(
            Integer institutionId) {

        return departmentRepository
                .findByInstitution_InstitutionId(institutionId);
    }


    // ============================================================
    // GET ONE DEPARTMENT AS LIST
    // Used by DEPARTMENT_HEAD
    // ============================================================

    public List<Department> getDepartmentListById(
            Integer departmentId) {

        Department department =
                departmentRepository.findById(departmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Department not found"
                                ));

        return List.of(department);
    }


    // ============================================================
    // SAVE DEPARTMENT
    // ============================================================

    public Department saveDepartment(
            Department department) {

        return departmentRepository.save(department);
    }


    // ============================================================
    // GET DEPARTMENT BY ID
    // ============================================================

    public Department getDepartmentById(Integer id) {

        return departmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Department not found"
                        ));
    }


    // ============================================================
    // DELETE DEPARTMENT
    // ============================================================

    public void deleteDepartment(Integer id) {

        departmentRepository.deleteById(id);
    }
}