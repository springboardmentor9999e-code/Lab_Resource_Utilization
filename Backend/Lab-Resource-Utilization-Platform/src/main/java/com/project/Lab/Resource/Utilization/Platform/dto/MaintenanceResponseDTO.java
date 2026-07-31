package com.project.Lab.Resource.Utilization.Platform.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class MaintenanceResponseDTO {

    private Integer maintenanceId;
    private Integer equipmentId;
    private Integer technicianId;
    private Integer reportedBy;

    private String issue;
    private String maintenanceType;
    private String issueDescription;

    private String status;

    private LocalDate scheduledDate;
    private LocalDate completedDate;

    private String remarks;

    private LocalDateTime createdAt;

    public MaintenanceResponseDTO() {
    }

    public MaintenanceResponseDTO(Integer maintenanceId,
                                  Integer equipmentId,
                                  Integer technicianId,
                                  Integer reportedBy,
                                  String issue,
                                  String maintenanceType,
                                  String issueDescription,
                                  String status,
                                  LocalDate scheduledDate,
                                  LocalDate completedDate,
                                  String remarks,
                                  LocalDateTime createdAt) {

        this.maintenanceId = maintenanceId;
        this.equipmentId = equipmentId;
        this.technicianId = technicianId;
        this.reportedBy = reportedBy;
        this.issue = issue;
        this.maintenanceType = maintenanceType;
        this.issueDescription = issueDescription;
        this.status = status;
        this.scheduledDate = scheduledDate;
        this.completedDate = completedDate;
        this.remarks = remarks;
        this.createdAt = createdAt;
    }

    public Integer getMaintenanceId() {
        return maintenanceId;
    }

    public void setMaintenanceId(Integer maintenanceId) {
        this.maintenanceId = maintenanceId;
    }

    public Integer getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Integer equipmentId) {
        this.equipmentId = equipmentId;
    }

    public Integer getTechnicianId() {
        return technicianId;
    }

    public void setTechnicianId(Integer technicianId) {
        this.technicianId = technicianId;
    }

    public Integer getReportedBy() {
        return reportedBy;
    }

    public void setReportedBy(Integer reportedBy) {
        this.reportedBy = reportedBy;
    }

    public String getIssue() {
        return issue;
    }

    public void setIssue(String issue) {
        this.issue = issue;
    }

    public String getMaintenanceType() {
        return maintenanceType;
    }

    public void setMaintenanceType(String maintenanceType) {
        this.maintenanceType = maintenanceType;
    }

    public String getIssueDescription() {
        return issueDescription;
    }

    public void setIssueDescription(String issueDescription) {
        this.issueDescription = issueDescription;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(LocalDate scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public LocalDate getCompletedDate() {
        return completedDate;
    }

    public void setCompletedDate(LocalDate completedDate) {
        this.completedDate = completedDate;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}