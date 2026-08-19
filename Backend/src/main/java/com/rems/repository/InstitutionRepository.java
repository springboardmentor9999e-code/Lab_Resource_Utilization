package com.rems.repository;

import com.rems.entity.Institution;
import com.rems.enums.InstitutionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InstitutionRepository extends JpaRepository<Institution, Long> {

    List<Institution> findByStatus(InstitutionStatus status);

    boolean existsByContactEmail(String email);
}
