package com.lab.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "calibrations")
public class Calibration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @Column(nullable = false)
    private LocalDate calibrationDate;

    @Column(nullable = false)
    private LocalDate nextCalibrationDate;

    @Column(length = 500)
    private String remarks;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CalibrationStatus status;

    public Calibration() {
    }

    public Calibration(Long id, Equipment equipment, LocalDate calibrationDate,
                       LocalDate nextCalibrationDate, String remarks,
                       CalibrationStatus status) {
        this.id = id;
        this.equipment = equipment;
        this.calibrationDate = calibrationDate;
        this.nextCalibrationDate = nextCalibrationDate;
        this.remarks = remarks;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Equipment getEquipment() {
        return equipment;
    }

    public void setEquipment(Equipment equipment) {
        this.equipment = equipment;
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

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public CalibrationStatus getStatus() {
        return status;
    }

    public void setStatus(CalibrationStatus status) {
        this.status = status;
    }
}