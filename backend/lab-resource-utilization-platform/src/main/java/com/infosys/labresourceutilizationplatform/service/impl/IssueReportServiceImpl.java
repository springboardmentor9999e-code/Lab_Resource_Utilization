package com.infosys.labresourceutilizationplatform.service.impl;

import com.infosys.labresourceutilizationplatform.entity.Equipment;
import com.infosys.labresourceutilizationplatform.entity.IssueReport;
import com.infosys.labresourceutilizationplatform.entity.User;
import com.infosys.labresourceutilizationplatform.repository.EquipmentRepository;
import com.infosys.labresourceutilizationplatform.repository.IssueReportRepository;
import com.infosys.labresourceutilizationplatform.repository.UserRepository;
import com.infosys.labresourceutilizationplatform.service.IssueReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class IssueReportServiceImpl implements IssueReportService {

    @Autowired
    private IssueReportRepository issueReportRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public IssueReport reportIssue(Long equipmentId, String description, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        // Update equipment status to Under Maintenance when reported
        equipment.setStatus("Under Maintenance");
        equipmentRepository.save(equipment);

        IssueReport report = new IssueReport();
        report.setEquipment(equipment);
        report.setReportedBy(user);
        report.setDescription(description);
        report.setReportedDate(LocalDate.now());
        report.setStatus("PENDING");

        return issueReportRepository.save(report);
    }

    @Override
    public List<IssueReport> getAllIssues(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String roleName = user.getRole().getRoleName();
        List<IssueReport> allIssues = issueReportRepository.findAll();

        if ("SYSTEM_ADMIN".equalsIgnoreCase(roleName)) {
            return allIssues;
        } else if ("INSTITUTION_ADMIN".equalsIgnoreCase(roleName)) {
            return allIssues.stream()
                    .filter(issue -> issue.getEquipment() != null 
                            && issue.getEquipment().getLaboratory() != null 
                            && issue.getEquipment().getLaboratory().getDepartment() != null 
                            && issue.getEquipment().getLaboratory().getDepartment().getInstitution() != null 
                            && issue.getEquipment().getLaboratory().getDepartment().getInstitution().getInstitutionId().equals(Long.valueOf(user.getInstitutionId())))
                    .collect(Collectors.toList());
        } else if ("LAB_MANAGER".equalsIgnoreCase(roleName) || "DEPARTMENT_HEAD".equalsIgnoreCase(roleName) || "LAB_TECHNICIAN".equalsIgnoreCase(roleName)) {
            return allIssues.stream()
                    .filter(issue -> issue.getEquipment() != null 
                            && issue.getEquipment().getLaboratory() != null 
                            && issue.getEquipment().getLaboratory().getDepartment() != null 
                            && issue.getEquipment().getLaboratory().getDepartment().getDepartmentId().equals(Long.valueOf(user.getDepartmentId())))
                    .collect(Collectors.toList());
        } else {
            // STUDENT or RESEARCHER: only their own reported issues
            return allIssues.stream()
                    .filter(issue -> issue.getReportedBy() != null && issue.getReportedBy().getUserId().equals(user.getUserId()))
                    .collect(Collectors.toList());
        }
    }

    @Override
    public IssueReport updateIssueStatus(Long reportId, String status, String resolutionDetails) {
        IssueReport report = issueReportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Issue report not found"));

        report.setStatus(status);
        if ("RESOLVED".equalsIgnoreCase(status)) {
            report.setResolutionDetails(resolutionDetails);
            report.setResolvedDate(LocalDate.now());

            // Set equipment back to Available upon resolution
            Equipment eq = report.getEquipment();
            eq.setStatus("Available");
            equipmentRepository.save(eq);
        } else if ("IN_PROGRESS".equalsIgnoreCase(status)) {
            Equipment eq = report.getEquipment();
            eq.setStatus("Under Maintenance");
            equipmentRepository.save(eq);
        }

        return issueReportRepository.save(report);
    }

    @Override
    public IssueReport assignIssue(Long reportId, Integer technicianUserId) {
        IssueReport report = issueReportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Issue report not found"));

        User technician = userRepository.findById(technicianUserId)
                .orElseThrow(() -> new RuntimeException("Technician user not found"));

        report.setAssignedTo(technician);
        return issueReportRepository.save(report);
    }
}
