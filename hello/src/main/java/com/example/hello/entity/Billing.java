package com.example.hello.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "billing")
public class Billing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer billingId;

    private Integer bookingId;

    private Integer fromInstitutionId;

    private Integer toInstitutionId;

    private Double amount;

    private String billingStatus;

    private LocalDateTime createdAt;

    public Billing() {
    }

    public Integer getBillingId() {
        return billingId;
    }

    public void setBillingId(Integer billingId) {
        this.billingId = billingId;
    }

    public Integer getBookingId() {
        return bookingId;
    }

    public void setBookingId(Integer bookingId) {
        this.bookingId = bookingId;
    }

    public Integer getFromInstitutionId() {
        return fromInstitutionId;
    }

    public void setFromInstitutionId(Integer fromInstitutionId) {
        this.fromInstitutionId = fromInstitutionId;
    }

    public Integer getToInstitutionId() {
        return toInstitutionId;
    }

    public void setToInstitutionId(Integer toInstitutionId) {
        this.toInstitutionId = toInstitutionId;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getBillingStatus() {
        return billingStatus;
    }

    public void setBillingStatus(String billingStatus) {
        this.billingStatus = billingStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}