package com.infosys.labresourceutilizationplatform.service;

import com.infosys.labresourceutilizationplatform.entity.IssueReport;
import java.util.List;

public interface IssueReportService {
    IssueReport reportIssue(Long equipmentId, String description, String userEmail);
    List<IssueReport> getAllIssues(String userEmail);
    IssueReport updateIssueStatus(Long reportId, String status, String resolutionDetails);
    IssueReport assignIssue(Long reportId, Integer technicianUserId);
}
