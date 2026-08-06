package com.infosys.labresourceutilizationplatform.service.impl;

import com.infosys.labresourceutilizationplatform.entity.Equipment;
import com.infosys.labresourceutilizationplatform.entity.IssueReport;
import com.infosys.labresourceutilizationplatform.entity.User;
import com.infosys.labresourceutilizationplatform.repository.EquipmentRepository;
import com.infosys.labresourceutilizationplatform.repository.IssueReportRepository;
import com.infosys.labresourceutilizationplatform.repository.UserRepository;
import com.infosys.labresourceutilizationplatform.service.IssueReportService;
import com.infosys.labresourceutilizationplatform.service.NotificationService;
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

    @Autowired
    private NotificationService notificationService;

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

        IssueReport saved = issueReportRepository.save(report);

        // Send notifications
        Long instId = user.getInstitutionId() != null ? Long.valueOf(user.getInstitutionId()) : null;
        String name = equipment.getEquipmentName();
        String issueMsg = "New issue reported for " + name + ": " + description;
        
        notificationService.sendNotification(null, "LAB_TECHNICIAN", instId, "New Issue Reported", issueMsg, "MAINTENANCE");
        notificationService.sendNotification(null, "LAB_MANAGER", instId, "New Issue Reported", issueMsg, "MAINTENANCE");
        notificationService.sendNotification(null, "LAB_MANAGER", instId, "Equipment Under Maintenance", name + " is now Under Maintenance due to a reported issue.", "MAINTENANCE");
        notificationService.sendNotification(null, "INSTITUTION_ADMIN", instId, "Equipment Under Maintenance", name + " is now Under Maintenance.", "MAINTENANCE");
        notificationService.sendNotification(null, "SYSTEM_ADMIN", null, "Equipment Under Maintenance", name + " is now Under Maintenance.", "MAINTENANCE");

        return saved;
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

        String oldStatus = report.getStatus();
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

        IssueReport saved = issueReportRepository.save(report);

        // Notify upon resolution/status change
        if (!status.equalsIgnoreCase(oldStatus)) {
            Equipment eq = saved.getEquipment();
            String name = eq != null ? eq.getEquipmentName() : "Equipment";
            Long instId = (eq != null && eq.getLaboratory() != null &&
                           eq.getLaboratory().getDepartment() != null &&
                           eq.getLaboratory().getDepartment().getInstitution() != null) ?
                           eq.getLaboratory().getDepartment().getInstitution().getInstitutionId() : null;

            if ("RESOLVED".equalsIgnoreCase(status)) {
                String resolveMsg = "Maintenance completed successfully for " + name + ". Resolution: " + resolutionDetails;
                 if (saved.getReportedBy() != null) {
                    notificationService.sendNotification(Long.valueOf(saved.getReportedBy().getUserId()), null, instId, "Maintenance Completed", resolveMsg, "MAINTENANCE");
                }
                notificationService.sendNotification(null, "LAB_TECHNICIAN", instId, "Maintenance Completed", resolveMsg, "MAINTENANCE");
                notificationService.sendNotification(null, "LAB_MANAGER", instId, "Maintenance Completed", resolveMsg, "MAINTENANCE");
                notificationService.sendNotification(null, "SYSTEM_ADMIN", null, "Maintenance Completed", resolveMsg, "MAINTENANCE");
            }
        }

        return saved;
    }

    @Override
    public IssueReport assignIssue(Long reportId, Integer technicianUserId) {
        IssueReport report = issueReportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Issue report not found"));

        User technician = userRepository.findById(technicianUserId)
                .orElseThrow(() -> new RuntimeException("Technician user not found"));

        report.setAssignedTo(technician);
        IssueReport saved = issueReportRepository.save(report);

        // Notify assigned technician
        Equipment eq = saved.getEquipment();
        String name = eq != null ? eq.getEquipmentName() : "Equipment";
        Long instId = technician.getInstitutionId() != null ? Long.valueOf(technician.getInstitutionId()) : null;
        
        notificationService.sendNotification(Long.valueOf(technician.getUserId()), "LAB_TECHNICIAN", instId, "Maintenance Assigned", "You have been assigned to maintenance task: " + saved.getDescription() + " for " + name, "MAINTENANCE");

        return saved;
    }
}
