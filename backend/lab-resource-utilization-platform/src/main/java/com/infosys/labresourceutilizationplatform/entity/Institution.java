package com.infosys.labresourceutilizationplatform.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "institution")
public class Institution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "institution_id")
    private Long institutionId;

    @Column(name = "institution_name", nullable = false, unique = true)
    private String institutionName;

    @Column(name = "institution_code", nullable = false, unique = true)
    private String institutionCode;

    private String address;

    private String city;

    private String state;

    private String pincode;

    private String contactEmail;

    private String contactPhone;

    private String website;

    private String status;

    public Institution() {
    }

    public Long getInstitutionId() {
        return institutionId;
    }

    public void setInstitutionId(Long institutionId) {
        this.institutionId = institutionId;
    }

    public String getInstitutionName() {
        return institutionName;
    }

    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
    }

    public String getInstitutionCode() {
        return institutionCode;
    }

    public void setInstitutionCode(String institutionCode) {
        this.institutionCode = institutionCode;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @Transient
    private Integer totalDepartments;

    @Transient
    private Integer totalLaboratories;

    @Transient
    private Integer totalEquipment;

    @Transient
    private Integer activeUsers;

    @Transient
    private String institutionAdministrator;

    @Transient
    private String equipmentUtilizationSummary;

    @Transient
    private String resourceSharingSummary;

    public Integer getTotalDepartments() {
        return totalDepartments;
    }

    public void setTotalDepartments(Integer totalDepartments) {
        this.totalDepartments = totalDepartments;
    }

    public Integer getTotalLaboratories() {
        return totalLaboratories;
    }

    public void setTotalLaboratories(Integer totalLaboratories) {
        this.totalLaboratories = totalLaboratories;
    }

    public Integer getTotalEquipment() {
        return totalEquipment;
    }

    public void setTotalEquipment(Integer totalEquipment) {
        this.totalEquipment = totalEquipment;
    }

    public Integer getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(Integer activeUsers) {
        this.activeUsers = activeUsers;
    }

    public String getInstitutionAdministrator() {
        return institutionAdministrator;
    }

    public void setInstitutionAdministrator(String institutionAdministrator) {
        this.institutionAdministrator = institutionAdministrator;
    }

    public String getEquipmentUtilizationSummary() {
        return equipmentUtilizationSummary;
    }

    public void setEquipmentUtilizationSummary(String equipmentUtilizationSummary) {
        this.equipmentUtilizationSummary = equipmentUtilizationSummary;
    }

    public String getResourceSharingSummary() {
        return resourceSharingSummary;
    }

    public void setResourceSharingSummary(String resourceSharingSummary) {
        this.resourceSharingSummary = resourceSharingSummary;
    }
}