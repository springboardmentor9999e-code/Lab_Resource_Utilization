package com.labhub.repository;

import com.labhub.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, UUID> {
    List<Department> findByInstitutionId(UUID institutionId);
    boolean existsByNameAndInstitutionId(String name, UUID institutionId);
    Optional<Department> findByNameAndInstitutionId(String name, UUID institutionId);
}
