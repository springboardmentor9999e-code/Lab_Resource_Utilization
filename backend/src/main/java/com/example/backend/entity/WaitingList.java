package com.example.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "waiting_list")
public class WaitingList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @Column(name = "request_time", nullable = false)
    private LocalDateTime requestTime;

    @Column(name = "queue_position")
    private Integer queuePosition;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private WaitingListStatus status;

    @Column(name = "demand_cost")
    private Double demandCost;

    public WaitingList() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Equipment getEquipment() {
        return equipment;
    }

    public void setEquipment(Equipment equipment) {
        this.equipment = equipment;
    }

    public LocalDateTime getRequestTime() {
        return requestTime;
    }

    public void setRequestTime(LocalDateTime requestTime) {
        this.requestTime = requestTime;
    }

    public Integer getQueuePosition() {
        return queuePosition;
    }

    public void setQueuePosition(Integer queuePosition) {
        this.queuePosition = queuePosition;
    }

    public WaitingListStatus getStatus() {
        return status;
    }

    public void setStatus(WaitingListStatus status) {
        this.status = status;
    }

    public Double getDemandCost() {
        return demandCost;
    }

    public void setDemandCost(Double demandCost) {
        this.demandCost = demandCost;
    }
}