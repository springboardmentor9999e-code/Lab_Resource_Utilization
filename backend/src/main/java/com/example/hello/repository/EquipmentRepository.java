package com.example.hello.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.hello.entity.Equipment;

import java.util.List;
import org.springframework.data.domain.Sort;

public interface EquipmentRepository
        extends JpaRepository<Equipment, Integer> {

    // Get equipment belonging to an institution
    List<Equipment> findByInstitutionId(Integer institutionId);

    // Get equipment belonging to an institution with sorting
    List<Equipment> findByInstitutionId(
            Integer institutionId,
            Sort sort
    );

    // Get equipment belonging to a department
    List<Equipment> findByDepartmentId(
            Integer departmentId,
            Sort sort
    );
}