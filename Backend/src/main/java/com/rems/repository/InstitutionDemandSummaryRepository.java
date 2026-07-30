package com.rems.repository;

import com.rems.entity.InstitutionDemandSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InstitutionDemandSummaryRepository extends JpaRepository<InstitutionDemandSummary, Long> {
    Optional<InstitutionDemandSummary> findByInstitutionInstitutionIdAndPeriodStartAndPeriodEndAndPeriodType(
            Long institutionId, LocalDate start, LocalDate end, String periodType);
}
