package com.project.Lab.Resource.Utilization.Platform.dto;

import java.time.LocalDateTime;

public class WaitlistResponseDTO {

    private Integer waitlistId;
    private Integer equipmentId;
    private Integer userId;
    private Integer priority;
    private String status;
    private LocalDateTime createdAt;

    public WaitlistResponseDTO() {
    }

    public WaitlistResponseDTO(Integer waitlistId,
                               Integer equipmentId,
                               Integer userId,
                               Integer priority,
                               String status,
                               LocalDateTime createdAt) {

        this.waitlistId = waitlistId;
        this.equipmentId = equipmentId;
        this.userId = userId;
        this.priority = priority;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Integer getWaitlistId() {
        return waitlistId;
    }

    public void setWaitlistId(Integer waitlistId) {
        this.waitlistId = waitlistId;
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

    public Integer getPriority() {
        return priority;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}