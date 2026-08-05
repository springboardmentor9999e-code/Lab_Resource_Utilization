package com.infosys.labresourceutilizationplatform.repository;

import com.infosys.labresourceutilizationplatform.entity.Laboratory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LaboratoryRepository extends JpaRepository<Laboratory, Long> {

    List<Laboratory> findByDepartmentDepartmentId(Long departmentId);

    boolean existsByLabNameAndDepartmentDepartmentId(String labName, Long departmentId);

    boolean existsByLabNameAndDepartmentDepartmentIdAndLabIdNot(String labName, Long departmentId, Long labId);

}