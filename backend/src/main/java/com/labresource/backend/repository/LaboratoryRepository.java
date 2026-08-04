package com.labresource.backend.repository;

import com.labresource.backend.entity.Laboratory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LaboratoryRepository extends JpaRepository<Laboratory, Long> {

    List<Laboratory> findByInstitutionInstitutionId(Long institutionId);

}