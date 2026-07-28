package com.lrplatform.repository;

import com.lrplatform.model.entity.Department;
import com.lrplatform.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    List<Department> findByInstitutionId(Long institutionId);
    Boolean existsByDepartmentNameAndInstitutionId(String name, Long institutionId);
    Optional<Department> findByHodId(Long hodId);
}
