package com.project.Lab.Resource.Utilization.Platform.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "waitlists")
public class Waitlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "waitlist_id")
    private Integer waitlistId;

    @Column(name = "equipment_id")
    private Integer equipmentId;

    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "priority")
    private Integer priority;

    @Column(name = "status")
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Waitlist() {
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