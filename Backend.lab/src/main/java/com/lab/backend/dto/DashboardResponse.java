package com.lab.backend.dto;

import java.util.List;
import java.util.Map;

public class DashboardResponse {

    private long totalEquipment;
    private long availableEquipment;
    private long inUseEquipment;
    private long underMaintenance;
    private double overallUtilizationPercentage;
    private Map<String, Object> departmentWiseUtilization;
    private List<Map<String, Object>> topUsedEquipment;

    public DashboardResponse() {
    }

    public DashboardResponse(long totalEquipment, long availableEquipment, long inUseEquipment, long underMaintenance, double overallUtilizationPercentage, Map<String, Object> departmentWiseUtilization, List<Map<String, Object>> topUsedEquipment) {
        this.totalEquipment = totalEquipment;
        this.availableEquipment = availableEquipment;
        this.inUseEquipment = inUseEquipment;
        this.underMaintenance = underMaintenance;
        this.overallUtilizationPercentage = overallUtilizationPercentage;
        this.departmentWiseUtilization = departmentWiseUtilization;
        this.topUsedEquipment = topUsedEquipment;
    }

    public long getTotalEquipment() {
        return totalEquipment;
    }

    public void setTotalEquipment(long totalEquipment) {
        this.totalEquipment = totalEquipment;
    }

    public long getAvailableEquipment() {
        return availableEquipment;
    }

    public void setAvailableEquipment(long availableEquipment) {
        this.availableEquipment = availableEquipment;
    }

    public long getInUseEquipment() {
        return inUseEquipment;
    }

    public void setInUseEquipment(long inUseEquipment) {
        this.inUseEquipment = inUseEquipment;
    }

    public long getUnderMaintenance() {
        return underMaintenance;
    }

    public void setUnderMaintenance(long underMaintenance) {
        this.underMaintenance = underMaintenance;
    }

    public double getOverallUtilizationPercentage() {
        return overallUtilizationPercentage;
    }

    public void setOverallUtilizationPercentage(double overallUtilizationPercentage) {
        this.overallUtilizationPercentage = overallUtilizationPercentage;
    }

    public Map<String, Object> getDepartmentWiseUtilization() {
        return departmentWiseUtilization;
    }

    public void setDepartmentWiseUtilization(Map<String, Object> departmentWiseUtilization) {
        this.departmentWiseUtilization = departmentWiseUtilization;
    }

    public List<Map<String, Object>> getTopUsedEquipment() {
        return topUsedEquipment;
    }

    public void setTopUsedEquipment(List<Map<String, Object>> topUsedEquipment) {
        this.topUsedEquipment = topUsedEquipment;
    }
}
