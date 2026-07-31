package com.project.Lab.Resource.Utilization.Platform.repository;

import com.project.Lab.Resource.Utilization.Platform.entity.Institution;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InstitutionRepository extends JpaRepository<Institution, Integer> {

    Optional<Institution> findByNameIgnoreCase(String name);

}