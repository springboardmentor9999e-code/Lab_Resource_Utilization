package com.infosys.labresourceutilizationplatform.repository;

import com.infosys.labresourceutilizationplatform.entity.IssueReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IssueReportRepository extends JpaRepository<IssueReport, Long> {
    List<IssueReport> findByEquipmentId(Long equipmentId);
    List<IssueReport> findByReportedByUserId(Integer userId);
}
