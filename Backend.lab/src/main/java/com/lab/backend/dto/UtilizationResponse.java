package com.lab.backend.dto;

import com.lab.backend.entity.Utilization;
import java.time.LocalDateTime;

public class UtilizationResponse {
    private Long id;
    private Long equipmentId;
    private String equipmentName;
    private Long userId;
    private String userName;
    private String department;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long durationMinutes;
    private String purpose;
    private String status;

    public UtilizationResponse() {
    }

    public UtilizationResponse(Utilization utilization) {
        if (utilization != null) {
            this.id = utilization.getId();
            if (utilization.getEquipment() != null) {
                this.equipmentId = utilization.getEquipment().getId();
                this.equipmentName = utilization.getEquipment().getName();
            }
            if (utilization.getUser() != null) {
                this.userId = utilization.getUser().getId();
                this.userName = utilization.getUser().getName();
            }
            this.department = utilization.getDepartment();
            this.startTime = utilization.getStartTime();
            this.endTime = utilization.getEndTime();
            this.durationMinutes = utilization.getDurationMinutes();
            this.purpose = utilization.getPurpose();
            this.status = utilization.getStatus();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public Long getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Long durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
