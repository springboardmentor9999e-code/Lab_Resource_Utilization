package com.lab.backend.dto;

public class LabUtilizationDTO {

    private String labName;
    private double utilization;

    public LabUtilizationDTO() {
    }

    public LabUtilizationDTO(String labName,
                             double utilization) {

        this.labName = labName;
        this.utilization = utilization;
    }

    public String getLabName() {
        return labName;
    }

    public void setLabName(String labName) {
        this.labName = labName;
    }

    public double getUtilization() {
        return utilization;
    }

    public void setUtilization(double utilization) {
        this.utilization = utilization;
    }
}