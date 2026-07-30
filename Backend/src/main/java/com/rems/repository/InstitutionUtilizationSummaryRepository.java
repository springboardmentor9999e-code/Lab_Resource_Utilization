package com.rems.repository;

import com.rems.entity.InstitutionUtilizationSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InstitutionUtilizationSummaryRepository extends JpaRepository<InstitutionUtilizationSummary, Long> {
    Optional<InstitutionUtilizationSummary> findByInstitutionInstitutionIdAndDate(Long institutionId, LocalDate date);
    List<InstitutionUtilizationSummary> findByInstitutionInstitutionIdAndDateBetween(Long institutionId, LocalDate start, LocalDate end);
}
