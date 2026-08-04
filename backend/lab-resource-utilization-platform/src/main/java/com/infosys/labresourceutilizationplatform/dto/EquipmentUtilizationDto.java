package com.infosys.labresourceutilizationplatform.dto;

public class EquipmentUtilizationDto {
    private Long equipmentId;
    private String equipmentName;
    private String category;
    private String serialNumber;
    private Double costPerHour;
    private Long usageCount;
    private Double totalHoursUsed;
    private Double utilizationPercentage;
    private Double totalCost;
    private String labName;
    private String departmentName;
    private String institutionName;

    public EquipmentUtilizationDto() {
    }

    public EquipmentUtilizationDto(Long equipmentId, String equipmentName, String category, String serialNumber,
                                   Double costPerHour, Long usageCount, Double totalHoursUsed,
                                   Double utilizationPercentage, Double totalCost, String labName,
                                   String departmentName, String institutionName) {
        this.equipmentId = equipmentId;
        this.equipmentName = equipmentName;
        this.category = category;
        this.serialNumber = serialNumber;
        this.costPerHour = costPerHour;
        this.usageCount = usageCount;
        this.totalHoursUsed = totalHoursUsed;
        this.utilizationPercentage = utilizationPercentage;
        this.totalCost = totalCost;
        this.labName = labName;
        this.departmentName = departmentName;
        this.institutionName = institutionName;
    }

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
        this.equipmentId = equipmentId;
    }

    public String getEquipmentName() {
        return equipmentName;
    }

    public void setEquipmentName(String equipmentName) {
        this.equipmentName = equipmentName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public Double getCostPerHour() {
        return costPerHour;
    }

    public void setCostPerHour(Double costPerHour) {
        this.costPerHour = costPerHour;
    }

    public Long getUsageCount() {
        return usageCount;
    }

    public void setUsageCount(Long usageCount) {
        this.usageCount = usageCount;
    }

    public Double getTotalHoursUsed() {
        return totalHoursUsed;
    }

    public void setTotalHoursUsed(Double totalHoursUsed) {
        this.totalHoursUsed = totalHoursUsed;
    }

    public Double getUtilizationPercentage() {
        return utilizationPercentage;
    }

    public void setUtilizationPercentage(Double utilizationPercentage) {
        this.utilizationPercentage = utilizationPercentage;
    }

    public Double getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(Double totalCost) {
        this.totalCost = totalCost;
    }

    public String getLabName() {
        return labName;
    }

    public void setLabName(String labName) {
        this.labName = labName;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getInstitutionName() {
        return institutionName;
    }

    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
    }
}
