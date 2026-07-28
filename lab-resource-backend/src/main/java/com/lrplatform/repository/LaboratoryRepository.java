package com.lrplatform.repository;

import com.lrplatform.model.entity.Laboratory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LaboratoryRepository extends JpaRepository<Laboratory, Long> {
    List<Laboratory> findByDepartmentId(Long departmentId);
    Boolean existsByLaboratoryNameAndDepartmentId(String name, Long departmentId);
}
