package com.lab.backend.dto;

import java.time.LocalDate;

public class ExternalBookingRequest {
    private String externalInstitutionName;
    private String externalUserEmail;
    private String externalUserName;
    private Long equipmentId;
    private LocalDate bookingDate;
    private LocalDate returnDate;
    private String purpose;

    public ExternalBookingRequest() {
    }

    public ExternalBookingRequest(String externalInstitutionName, String externalUserEmail, String externalUserName, Long equipmentId, LocalDate bookingDate, LocalDate returnDate, String purpose) {
        this.externalInstitutionName = externalInstitutionName;
        this.externalUserEmail = externalUserEmail;
        this.externalUserName = externalUserName;
        this.equipmentId = equipmentId;
        this.bookingDate = bookingDate;
        this.returnDate = returnDate;
        this.purpose = purpose;
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

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
        this.equipmentId = equipmentId;
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
}
