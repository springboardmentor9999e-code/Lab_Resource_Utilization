package com.example.backend.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "billings")
public class Billing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "billing_id")
    private Long id;

    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "equipment_id")
    private Long equipmentId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "requester_institution_id")
    private Integer requesterInstitutionId;

    @Column(name = "owner_institution_id")
    private Integer ownerInstitutionId;

    @Column(name = "hours_used")
    private BigDecimal hoursUsed;

    @Column(name = "hourly_rate")
    private BigDecimal hourlyRate;

    @Column(name = "total_cost")
    private BigDecimal totalCost;

    @Column(name = "billing_date")
    private LocalDate billingDate;

    @Column(name = "status")
    private String status; // UNPAID, PAID, CANCELLED

    @Column(name = "payment_reference")
    private String paymentReference;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Billing() {
    }

    public Billing(Long bookingId, Long equipmentId, Long userId,
                   Integer requesterInstitutionId, Integer ownerInstitutionId,
                   BigDecimal hoursUsed, BigDecimal hourlyRate, BigDecimal totalCost,
                   LocalDate billingDate, String status) {
        this.bookingId = bookingId;
        this.equipmentId = equipmentId;
        this.userId = userId;
        this.requesterInstitutionId = requesterInstitutionId;
        this.ownerInstitutionId = ownerInstitutionId;
        this.hoursUsed = hoursUsed;
        this.hourlyRate = hourlyRate;
        this.totalCost = totalCost;
        this.billingDate = billingDate;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBillingId() {
        return id;
    }

    public void setBillingId(Long id) {
        this.id = id;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
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

    public Integer getRequesterInstitutionId() {
        return requesterInstitutionId;
    }

    public void setRequesterInstitutionId(Integer requesterInstitutionId) {
        this.requesterInstitutionId = requesterInstitutionId;
    }

    public Integer getOwnerInstitutionId() {
        return ownerInstitutionId;
    }

    public void setOwnerInstitutionId(Integer ownerInstitutionId) {
        this.ownerInstitutionId = ownerInstitutionId;
    }

    public BigDecimal getHoursUsed() {
        return hoursUsed;
    }

    public void setHoursUsed(BigDecimal hoursUsed) {
        this.hoursUsed = hoursUsed;
    }

    public BigDecimal getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(BigDecimal hourlyRate) {
        this.hourlyRate = hourlyRate;
    }

    public BigDecimal getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(BigDecimal totalCost) {
        this.totalCost = totalCost;
    }

    public LocalDate getBillingDate() {
        return billingDate;
    }

    public void setBillingDate(LocalDate billingDate) {
        this.billingDate = billingDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPaymentReference() {
        return paymentReference;
    }

    public void setPaymentReference(String paymentReference) {
        this.paymentReference = paymentReference;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
