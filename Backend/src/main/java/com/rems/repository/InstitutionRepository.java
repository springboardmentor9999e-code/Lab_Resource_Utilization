package com.rems.repository;

import com.rems.entity.Institution;
import com.rems.enums.InstitutionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InstitutionRepository extends JpaRepository<Institution, Long> {

    List<Institution> findByStatus(InstitutionStatus status);

//    Optional<Institution> findByContactEmail(String contactEmail);

     boolean existsByContactEmail(String email);
}
