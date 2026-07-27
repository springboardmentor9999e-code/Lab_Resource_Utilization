package com.labresource.repository;

import com.labresource.entity.Lab;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LabRepository extends JpaRepository<Lab, Long> {
    
    Optional<Lab> findByCode(String code);
    
    List<Lab> findByDepartment_DepartmentId(Long departmentId);
}
