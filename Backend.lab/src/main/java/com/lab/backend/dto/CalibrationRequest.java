package com.lab.backend.dto;

import java.time.LocalDate;

public class CalibrationRequest {

    private Long equipmentId;
    private LocalDate calibrationDate;
    private LocalDate nextCalibrationDate;
    private String remarks;

    public CalibrationRequest() {
    }

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
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

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
