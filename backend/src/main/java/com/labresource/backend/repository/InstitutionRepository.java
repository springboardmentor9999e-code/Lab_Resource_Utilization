package com.labresource.backend.repository;

import com.labresource.backend.entity.Institution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InstitutionRepository
        extends JpaRepository<Institution, Long> {

}