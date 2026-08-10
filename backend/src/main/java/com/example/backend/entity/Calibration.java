package com.example.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "calibration")
public class Calibration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "calibration_id")
    private Long calibrationId;

    @Column(name = "resource_id")
    private Long resourceId;

    @Column(name = "calibration_date")
    private LocalDate calibrationDate;

    @Column(name = "next_due_date")
    private LocalDate nextDueDate;

    @Column(name = "performed_by")
    private String performedBy;

    @Column(name = "certificate_file")
    private String certificateFile;

    @Column(name = "remarks")
    private String remarks;

    @Column(name = "status")
    private String status;

    public Calibration() {
    }

    public Long getCalibrationId() {
        return calibrationId;
    }

    public void setCalibrationId(Long calibrationId) {
        this.calibrationId = calibrationId;
    }

    public Long getId() {
        return calibrationId;
    }

    public void setId(Long calibrationId) {
        this.calibrationId = calibrationId;
    }

    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    public LocalDate getCalibrationDate() {
        return calibrationDate;
    }

    public void setCalibrationDate(LocalDate calibrationDate) {
        this.calibrationDate = calibrationDate;
    }

    public LocalDate getNextDueDate() {
        return nextDueDate;
    }

    public void setNextDueDate(LocalDate nextDueDate) {
        this.nextDueDate = nextDueDate;
    }

    public String getPerformedBy() {
        return performedBy;
    }

    public void setPerformedBy(String performedBy) {
        this.performedBy = performedBy;
    }

    public String getCertificateFile() {
        return certificateFile;
    }

    public void setCertificateFile(String certificateFile) {
        this.certificateFile = certificateFile;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}