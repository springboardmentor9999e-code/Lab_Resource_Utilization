package com.lab.backend.dto;

import java.util.List;

public class DashboardDTO {

    private long totalEquipment;
    private long available;
    private long reserved;
    private long inUse;
    private long maintenance;
    private double utilizationPercentage;
    private String mostUsedEquipment;

    private List<LabUtilizationDTO> labs;

    public DashboardDTO() {
    }

    public DashboardDTO(long totalEquipment,
                        long available,
                        long reserved,
                        long inUse,
                        long maintenance,
                        double utilizationPercentage,
                        String mostUsedEquipment,
                        List<LabUtilizationDTO> labs) {

        this.totalEquipment = totalEquipment;
        this.available = available;
        this.reserved = reserved;
        this.inUse = inUse;
        this.maintenance = maintenance;
        this.utilizationPercentage = utilizationPercentage;
        this.mostUsedEquipment = mostUsedEquipment;
        this.labs = labs;
    }

    public long getTotalEquipment() {
        return totalEquipment;
    }

    public void setTotalEquipment(long totalEquipment) {
        this.totalEquipment = totalEquipment;
    }

    public long getAvailable() {
        return available;
    }

    public void setAvailable(long available) {
        this.available = available;
    }

    public long getAvailableEquipment() {
        return available;
    }

    public long getReserved() {
        return reserved;
    }

    public void setReserved(long reserved) {
        this.reserved = reserved;
    }

    public long getInUse() {
        return inUse;
    }

    public void setInUse(long inUse) {
        this.inUse = inUse;
    }

    public long getInUseEquipment() {
        return inUse;
    }

    public long getMaintenance() {
        return maintenance;
    }

    public void setMaintenance(long maintenance) {
        this.maintenance = maintenance;
    }

    public long getUnderMaintenance() {
        return maintenance;
    }

    public double getUtilizationPercentage() {
        return utilizationPercentage;
    }

    public void setUtilizationPercentage(double utilizationPercentage) {
        this.utilizationPercentage = utilizationPercentage;
    }

    public String getMostUsedEquipment() {
        return mostUsedEquipment;
    }

    public void setMostUsedEquipment(String mostUsedEquipment) {
        this.mostUsedEquipment = mostUsedEquipment;
    }

    public List<LabUtilizationDTO> getLabs() {
        return labs;
    }

    public void setLabs(List<LabUtilizationDTO> labs) {
        this.labs = labs;
    }
}