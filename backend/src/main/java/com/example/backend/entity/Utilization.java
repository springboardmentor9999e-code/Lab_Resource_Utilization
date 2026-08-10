package com.example.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "utilization")
public class Utilization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "utilization_id")
    private Long utilizationId;

    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "equipment_id")
    private Long equipmentId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "usage_date")
    private LocalDate usageDate;

    @Column(name = "hours_used")
    private BigDecimal hoursUsed;

    @Column(name = "remarks")
    private String remarks;

    public Utilization() {
    }

    public Long getUtilizationId() {
        return utilizationId;
    }

    public void setUtilizationId(Long utilizationId) {
        this.utilizationId = utilizationId;
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

    public LocalDate getUsageDate() {
        return usageDate;
    }

    public void setUsageDate(LocalDate usageDate) {
        this.usageDate = usageDate;
    }

    public BigDecimal getHoursUsed() {
        return hoursUsed;
    }

    public void setHoursUsed(BigDecimal hoursUsed) {
        this.hoursUsed = hoursUsed;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}