package com.lab.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

@Entity
@Table(name = "external_bookings")
public class ExternalBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String externalInstitutionName;
    private String externalUserEmail;
    private String externalUserName;

    @NotNull(message = "Equipment is required")
    @ManyToOne
    @JoinColumn(name = "equipment_id")
    @JsonIgnoreProperties({"laboratory"})
    private Equipment equipment;

    private LocalDate bookingDate;
    private LocalDate returnDate;
    private String purpose;
    private String status; // PENDING, APPROVED, CANCELLED

    public ExternalBooking() {
    }

    public ExternalBooking(Long id, String externalInstitutionName, String externalUserEmail, String externalUserName, Equipment equipment, LocalDate bookingDate, LocalDate returnDate, String purpose, String status) {
        this.id = id;
        this.externalInstitutionName = externalInstitutionName;
        this.externalUserEmail = externalUserEmail;
        this.externalUserName = externalUserName;
        this.equipment = equipment;
        this.bookingDate = bookingDate;
        this.returnDate = returnDate;
        this.purpose = purpose;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getExternalInstitutionName() {
        return externalInstitutionName;
    }

    public void setExternalInstitutionName(String externalInstitutionName) {
        this.externalInstitutionName = externalInstitutionName;
    }

    public String getExternalUserEmail() {
        return externalUserEmail;
    }

    public void setExternalUserEmail(String externalUserEmail) {
        this.externalUserEmail = externalUserEmail;
    }

    public String getExternalUserName() {
        return externalUserName;
    }

    public void setExternalUserName(String externalUserName) {
        this.externalUserName = externalUserName;
    }

    public Equipment getEquipment() {
        return equipment;
    }

    public void setEquipment(Equipment equipment) {
        this.equipment = equipment;
    }

    public LocalDate getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(LocalDate bookingDate) {
        this.bookingDate = bookingDate;
    }

    public LocalDate getReturnDate() {
        return returnDate;
    }

    public void setReturnDate(LocalDate returnDate) {
        this.returnDate = returnDate;
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
