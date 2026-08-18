package com.lab.backend.dto;

public class ReportDTO {

    private long totalLaboratories;
    private long totalEquipment;
    private long totalBookings;
    private long totalCalibrations;
    private long totalMaintenances;

    public ReportDTO() {
    }

    public ReportDTO(long totalLaboratories,
                     long totalEquipment,
                     long totalBookings,
                     long totalCalibrations,
                     long totalMaintenances) {
        this.totalLaboratories = totalLaboratories;
        this.totalEquipment = totalEquipment;
        this.totalBookings = totalBookings;
        this.totalCalibrations = totalCalibrations;
        this.totalMaintenances = totalMaintenances;
    }

    public long getTotalLaboratories() {
        return totalLaboratories;
    }

    public void setTotalLaboratories(long totalLaboratories) {
        this.totalLaboratories = totalLaboratories;
    }

    public long getTotalEquipment() {
        return totalEquipment;
    }

    public void setTotalEquipment(long totalEquipment) {
        this.totalEquipment = totalEquipment;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public long getTotalCalibrations() {
        return totalCalibrations;
    }

    public void setTotalCalibrations(long totalCalibrations) {
        this.totalCalibrations = totalCalibrations;
    }

    public long getTotalMaintenances() {
        return totalMaintenances;
    }

    public void setTotalMaintenances(long totalMaintenances) {
        this.totalMaintenances = totalMaintenances;
    }
}