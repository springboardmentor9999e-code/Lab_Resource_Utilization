package com.example.hello.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "calibration_certification")
public class CalibrationCertification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "calibration_id")
    private Integer calibrationId;

    @Column(name = "equipment_id")
    private Integer equipmentId;

    @Column(name = "calibration_date")
    private LocalDate calibrationDate;

    @Column(name = "next_calibration_date")
    private LocalDate nextCalibrationDate;

    @Column(name = "certification_name")
    private String certificationName;

    @Column(name = "certification_expiry_date")
    private LocalDate certificationExpiryDate;

    @Column(name = "status")
    private String status;

    @Column(name = "notes")
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public CalibrationCertification() {
    }

    public Integer getCalibrationId() {
        return calibrationId;
    }

    public void setCalibrationId(Integer calibrationId) {
        this.calibrationId = calibrationId;
    }

    public Integer getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Integer equipmentId) {
        this.equipmentId = equipmentId;
    }

    public LocalDate getCalibrationDate() {
        return calibrationDate;
    }

    public void setCalibrationDate(LocalDate calibrationDate) {
        this.calibrationDate = calibrationDate;
    }

    public LocalDate getNextCalibrationDate() {
        return nextCalibrationDate;
    }

    public void setNextCalibrationDate(LocalDate nextCalibrationDate) {
        this.nextCalibrationDate = nextCalibrationDate;
    }

    public String getCertificationName() {
        return certificationName;
    }

    public void setCertificationName(String certificationName) {
        this.certificationName = certificationName;
    }

    public LocalDate getCertificationExpiryDate() {
        return certificationExpiryDate;
    }

    public void setCertificationExpiryDate(LocalDate certificationExpiryDate) {
        this.certificationExpiryDate = certificationExpiryDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();

        if (this.status == null || this.status.isEmpty()) {
            this.status = "VALID";
        }
    }
}