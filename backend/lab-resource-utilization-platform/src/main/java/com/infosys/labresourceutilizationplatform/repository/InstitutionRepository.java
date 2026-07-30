package com.infosys.labresourceutilizationplatform.repository;

import com.infosys.labresourceutilizationplatform.entity.Institution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InstitutionRepository extends JpaRepository<Institution, Long> {
}