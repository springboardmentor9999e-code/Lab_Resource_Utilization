package com.labhub.repository;

import com.labhub.entity.Institution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface InstitutionRepository extends JpaRepository<Institution, UUID> {
    Optional<Institution> findByName(String name);
    Optional<Institution> findByCode(String code);
    boolean existsByName(String name);
    boolean existsByCode(String code);
}
