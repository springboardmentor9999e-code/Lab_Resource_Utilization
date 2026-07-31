package com.project.Lab.Resource.Utilization.Platform.dto;

public class WaitlistRequestDTO {

    private Integer equipmentId;
    private Integer userId;

    public WaitlistRequestDTO() {
    }

    public Integer getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Integer equipmentId) {
        this.equipmentId = equipmentId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }
}