package com.rems.repository;

import com.rems.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DepartmentRepository extends JpaRepository<Department, Long> {

    List<Department> findByInstitution_InstitutionId(Long institutionId);

}
