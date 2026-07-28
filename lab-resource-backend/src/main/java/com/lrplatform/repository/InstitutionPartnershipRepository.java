package com.lrplatform.repository;

import com.lrplatform.model.entity.InstitutionPartnership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InstitutionPartnershipRepository extends JpaRepository<InstitutionPartnership, Long> {
    List<InstitutionPartnership> findByInstitutionAIdOrInstitutionBId(Long instA, Long instB);
    Boolean existsByInstitutionAIdAndInstitutionBIdAndStatus(Long instA, Long instB, String status);
}
