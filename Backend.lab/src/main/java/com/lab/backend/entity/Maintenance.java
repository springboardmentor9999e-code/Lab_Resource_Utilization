package com.lab.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "maintenance")
public class Maintenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @Column(nullable = false)
    private LocalDate maintenanceDate;

    @Column(nullable = false)
    private String maintenanceType;

    @Column(length = 500)
    private String description;

    private Double cost;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaintenanceStatus status;

    public Maintenance() {
    }

    public Maintenance(Long id,
                       Equipment equipment,
                       LocalDate maintenanceDate,
                       String maintenanceType,
                       String description,
                       Double cost,
                       MaintenanceStatus status) {
        this.id = id;
        this.equipment = equipment;
        this.maintenanceDate = maintenanceDate;
        this.maintenanceType = maintenanceType;
        this.description = description;
        this.cost = cost;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Equipment getEquipment() {
        return equipment;
    }

    public void setEquipment(Equipment equipment) {
        this.equipment = equipment;
    }

    public LocalDate getMaintenanceDate() {
        return maintenanceDate;
    }

    public void setMaintenanceDate(LocalDate maintenanceDate) {
        this.maintenanceDate = maintenanceDate;
    }

    public String getMaintenanceType() {
        return maintenanceType;
    }

    public void setMaintenanceType(String maintenanceType) {
        this.maintenanceType = maintenanceType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getCost() {
        return cost;
    }

    public void setCost(Double cost) {
        this.cost = cost;
    }

    public MaintenanceStatus getStatus() {
        return status;
    }

    public void setStatus(MaintenanceStatus status) {
        this.status = status;
    }

    // Compatibility getter/setter for legacy code
    public String getIssueDescription() {
        return description;
    }

    public void setIssueDescription(String issueDescription) {
        this.description = issueDescription;
    }
}