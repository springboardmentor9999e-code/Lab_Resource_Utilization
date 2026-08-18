package com.lab.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.lab.backend.enums.ResourceShareStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

@Entity
@Table(name = "resource_shares")
public class ResourceShare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Start date is required")
    @FutureOrPresent(message = "Start date cannot be in the past")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    private String purpose;

    @Enumerated(EnumType.STRING)
    private ResourceShareStatus status;

    @NotNull(message = "Requesting user is required")
    @ManyToOne
    @JoinColumn(name = "requested_by_id")
    @JsonIgnoreProperties({"password"})
    private User requestedBy;

    @NotNull(message = "Equipment is required")
    @ManyToOne
    @JoinColumn(name = "equipment_id")
    @JsonIgnoreProperties({"bookings"})
    private Equipment equipment;

    @NotNull(message = "Source laboratory is required")
    @ManyToOne
    @JoinColumn(name = "source_laboratory_id")
    private Laboratory sourceLaboratory;

    @NotNull(message = "Target laboratory is required")
    @ManyToOne
    @JoinColumn(name = "target_laboratory_id")
    private Laboratory targetLaboratory;

    public ResourceShare() {
    }

    public ResourceShare(Long id,
                         LocalDate startDate,
                         LocalDate endDate,
                         String purpose,
                         ResourceShareStatus status,
                         User requestedBy,
                         Equipment equipment,
                         Laboratory sourceLaboratory,
                         Laboratory targetLaboratory) {
        this.id = id;
        this.startDate = startDate;
        this.endDate = endDate;
        this.purpose = purpose;
        this.status = status;
        this.requestedBy = requestedBy;
        this.equipment = equipment;
        this.sourceLaboratory = sourceLaboratory;
        this.targetLaboratory = targetLaboratory;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public ResourceShareStatus getStatus() {
        return status;
    }

    public void setStatus(ResourceShareStatus status) {
        this.status = status;
    }

    public User getRequestedBy() {
        return requestedBy;
    }

    public void setRequestedBy(User requestedBy) {
        this.requestedBy = requestedBy;
    }

    public Equipment getEquipment() {
        return equipment;
    }

    public void setEquipment(Equipment equipment) {
        this.equipment = equipment;
    }

    public Laboratory getSourceLaboratory() {
        return sourceLaboratory;
    }

    public void setSourceLaboratory(Laboratory sourceLaboratory) {
        this.sourceLaboratory = sourceLaboratory;
    }

    public Laboratory getTargetLaboratory() {
        return targetLaboratory;
    }

    public void setTargetLaboratory(Laboratory targetLaboratory) {
        this.targetLaboratory = targetLaboratory;
    }
}
