package com.infosys.labresourceutilizationplatform.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "issue_reports")
public class IssueReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Long reportId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "equipment_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Equipment equipment;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User reportedBy;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "reported_date", nullable = false)
    private LocalDate reportedDate;

    @Column(name = "status", nullable = false, length = 30)
    private String status; // PENDING, IN_PROGRESS, RESOLVED

    @Column(name = "resolution_details", columnDefinition = "TEXT")
    private String resolutionDetails;

    @Column(name = "resolved_date")
    private LocalDate resolvedDate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_to_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User assignedTo;

    public IssueReport() {
    }

    public Long getReportId() {
        return reportId;
    }

    public void setReportId(Long reportId) {
        this.reportId = reportId;
    }

    public Equipment getEquipment() {
        return equipment;
    }

    public void setEquipment(Equipment equipment) {
        this.equipment = equipment;
    }

    public User getReportedBy() {
        return reportedBy;
    }

    public void setReportedBy(User reportedBy) {
        this.reportedBy = reportedBy;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getReportedDate() {
        return reportedDate;
    }

    public void setReportedDate(LocalDate reportedDate) {
        this.reportedDate = reportedDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getResolutionDetails() {
        return resolutionDetails;
    }

    public void setResolutionDetails(String resolutionDetails) {
        this.resolutionDetails = resolutionDetails;
    }

    public LocalDate getResolvedDate() {
        return resolvedDate;
    }

    public void setResolvedDate(LocalDate resolvedDate) {
        this.resolvedDate = resolvedDate;
    }

    public User getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(User assignedTo) {
        this.assignedTo = assignedTo;
    }
}
