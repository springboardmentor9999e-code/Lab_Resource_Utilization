package com.example.hello.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.hello.entity.Department;

public interface DepartmentRepository
        extends JpaRepository<Department, Integer> {

    List<Department> findByInstitution_InstitutionId(Integer institutionId);

}