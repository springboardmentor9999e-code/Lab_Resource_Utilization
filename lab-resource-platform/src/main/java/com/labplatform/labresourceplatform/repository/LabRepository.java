package com.labplatform.labresourceplatform.repository;

import com.labplatform.labresourceplatform.entity.Lab;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LabRepository extends JpaRepository<Lab, Long> {

    List<Lab> findByInstitution_InstitutionId(Long institutionId);
}
