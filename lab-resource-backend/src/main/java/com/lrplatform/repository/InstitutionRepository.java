package com.lrplatform.repository;

import com.lrplatform.model.entity.Institution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InstitutionRepository extends JpaRepository<Institution, Long> {
    Optional<Institution> findByInstitutionCode(String code);
    Boolean existsByInstitutionCode(String code);
    Boolean existsByEmail(String email);
}
