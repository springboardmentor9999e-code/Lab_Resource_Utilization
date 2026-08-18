package com.lab.backend.dto;

public class UtilizationRequest {
    private Long equipmentId;
    private Long userId;
    private String department;
    private String purpose;

    public UtilizationRequest() {
    }

    public UtilizationRequest(Long equipmentId, Long userId, String department, String purpose) {
        this.equipmentId = equipmentId;
        this.userId = userId;
        this.department = department;
        this.purpose = purpose;
    }

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
        this.equipmentId = equipmentId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }
}
