package com.infosys.labresourceutilizationplatform.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "equipment")
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String equipmentName;

    @Column(nullable = false)
    private String category;

    @Column(length = 1000)
    private String description;

    private String manufacturer;

    private String model;

    @Column(unique = true)
    private String serialNumber;

    private LocalDate purchaseDate;

    private LocalDate warrantyExpiryDate;

    private Integer totalQuantity;

    private Integer availableQuantity;

    private String status;

    private String imageUrl;

    private String documentUrl;

    @Column(name = "cost_per_hour")
    private Double costPerHour = 0.0;

    @Column(length = 2000)
    private String specifications;

    @Column(name = "calibration_frequency")
    private String calibrationFrequency = "Every 3 Months";

    @Column(name = "last_calibration_date")
    private LocalDate lastCalibrationDate = LocalDate.now().minusMonths(1);

    @Column(name = "next_calibration_date")
    private LocalDate nextCalibrationDate = LocalDate.now().plusMonths(2);

    @Column(name = "calibration_status")
    private String calibrationStatus = "Scheduled";

    @Column(name = "license_number")
    private String licenseNumber = "LIC-9834821";

    @Column(name = "license_issue_date")
    private LocalDate licenseIssueDate = LocalDate.now().minusMonths(3);

    @Column(name = "license_expiry_date")
    private LocalDate licenseExpiryDate = LocalDate.now().plusMonths(3);

    @Column(name = "license_renewal_frequency")
    private String licenseRenewalFrequency = "Every 6 Months";

    @Column(name = "license_renewal_date")
    private LocalDate licenseRenewalDate = LocalDate.now().plusMonths(3);

    @Column(name = "certificate_number")
    private String certificateNumber = "CERT-2983719";

    @Column(name = "certificate_issue_date")
    private LocalDate certificateIssueDate = LocalDate.now().minusMonths(3);

    @Column(name = "certificate_expiry_date")
    private LocalDate certificateExpiryDate = LocalDate.now().plusMonths(3);

    @Column(name = "certificate_renewal_frequency")
    private String certificateRenewalFrequency = "Every 6 Months";

    @Column(name = "certificate_renewal_date")
    private LocalDate certificateRenewalDate = LocalDate.now().plusMonths(3);

    @Column(name = "license_status")
    private String licenseStatus = "Active";

    @Column(name = "certificate_status")
    private String certificateStatus = "Active";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "laboratory_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Laboratory laboratory;

    public Equipment() {
    }

    public Equipment(Long id,
                     String equipmentName,
                     String category,
                     String description,
                     String manufacturer,
                     String model,
                     String serialNumber,
                     LocalDate purchaseDate,
                     LocalDate warrantyExpiryDate,
                     Integer totalQuantity,
                     Integer availableQuantity,
                     String status,
                     String imageUrl,
                     String documentUrl,
                     Laboratory laboratory) {

        this.id = id;
        this.equipmentName = equipmentName;
        this.category = category;
        this.description = description;
        this.manufacturer = manufacturer;
        this.model = model;
        this.serialNumber = serialNumber;
        this.purchaseDate = purchaseDate;
        this.warrantyExpiryDate = warrantyExpiryDate;
        this.totalQuantity = totalQuantity;
        this.availableQuantity = availableQuantity;
        this.status = status;
        this.imageUrl = imageUrl;
        this.documentUrl = documentUrl;
        this.laboratory = laboratory;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEquipmentName() {
        return equipmentName;
    }

    public void setEquipmentName(String equipmentName) {
        this.equipmentName = equipmentName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public LocalDate getWarrantyExpiryDate() {
        return warrantyExpiryDate;
    }

    public void setWarrantyExpiryDate(LocalDate warrantyExpiryDate) {
        this.warrantyExpiryDate = warrantyExpiryDate;
    }

    public Integer getTotalQuantity() {
        return totalQuantity;
    }

    public void setTotalQuantity(Integer totalQuantity) {
        this.totalQuantity = totalQuantity;
    }

    public Integer getAvailableQuantity() {
        return availableQuantity;
    }

    public void setAvailableQuantity(Integer availableQuantity) {
        this.availableQuantity = availableQuantity;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getDocumentUrl() {
        return documentUrl;
    }

    public void setDocumentUrl(String documentUrl) {
        this.documentUrl = documentUrl;
    }

    public Laboratory getLaboratory() {
        return laboratory;
    }

    public void setLaboratory(Laboratory laboratory) {
        this.laboratory = laboratory;
    }

    public Double getCostPerHour() {
        return (costPerHour != null && costPerHour > 0) ? costPerHour : 5.0;
    }

    public void setCostPerHour(Double costPerHour) {
        this.costPerHour = costPerHour;
    }

    public String getSpecifications() {
        return specifications;
    }

    public void setSpecifications(String specifications) {
        this.specifications = specifications;
    }

    public String getCalibrationFrequency() {
        return calibrationFrequency;
    }

    public void setCalibrationFrequency(String calibrationFrequency) {
        this.calibrationFrequency = calibrationFrequency;
    }

    public LocalDate getLastCalibrationDate() {
        return lastCalibrationDate;
    }

    public void setLastCalibrationDate(LocalDate lastCalibrationDate) {
        this.lastCalibrationDate = lastCalibrationDate;
    }

    public LocalDate getNextCalibrationDate() {
        return nextCalibrationDate;
    }

    public void setNextCalibrationDate(LocalDate nextCalibrationDate) {
        this.nextCalibrationDate = nextCalibrationDate;
    }

    public String getCalibrationStatus() {
        return calibrationStatus;
    }

    public void setCalibrationStatus(String calibrationStatus) {
        this.calibrationStatus = calibrationStatus;
    }

    public String getLicenseNumber() {
        return licenseNumber;
    }

    public void setLicenseNumber(String licenseNumber) {
        this.licenseNumber = licenseNumber;
    }

    public LocalDate getLicenseIssueDate() {
        return licenseIssueDate;
    }

    public void setLicenseIssueDate(LocalDate licenseIssueDate) {
        this.licenseIssueDate = licenseIssueDate;
    }

    public LocalDate getLicenseExpiryDate() {
        return licenseExpiryDate;
    }

    public void setLicenseExpiryDate(LocalDate licenseExpiryDate) {
        this.licenseExpiryDate = licenseExpiryDate;
    }

    public String getLicenseRenewalFrequency() {
        return licenseRenewalFrequency;
    }

    public void setLicenseRenewalFrequency(String licenseRenewalFrequency) {
        this.licenseRenewalFrequency = licenseRenewalFrequency;
    }

    public LocalDate getLicenseRenewalDate() {
        return licenseRenewalDate;
    }

    public void setLicenseRenewalDate(LocalDate licenseRenewalDate) {
        this.licenseRenewalDate = licenseRenewalDate;
    }

    public String getCertificateNumber() {
        return certificateNumber;
    }

    public void setCertificateNumber(String certificateNumber) {
        this.certificateNumber = certificateNumber;
    }

    public LocalDate getCertificateIssueDate() {
        return certificateIssueDate;
    }

    public void setCertificateIssueDate(LocalDate certificateIssueDate) {
        this.certificateIssueDate = certificateIssueDate;
    }

    public LocalDate getCertificateExpiryDate() {
        return certificateExpiryDate;
    }

    public void setCertificateExpiryDate(LocalDate certificateExpiryDate) {
        this.certificateExpiryDate = certificateExpiryDate;
    }

    public String getCertificateRenewalFrequency() {
        return certificateRenewalFrequency;
    }

    public void setCertificateRenewalFrequency(String certificateRenewalFrequency) {
        this.certificateRenewalFrequency = certificateRenewalFrequency;
    }

    public LocalDate getCertificateRenewalDate() {
        return certificateRenewalDate;
    }

    public void setCertificateRenewalDate(LocalDate certificateRenewalDate) {
        this.certificateRenewalDate = certificateRenewalDate;
    }

    public String getLicenseStatus() {
        return licenseStatus;
    }

    public void setLicenseStatus(String licenseStatus) {
        this.licenseStatus = licenseStatus;
    }

    public String getCertificateStatus() {
        return certificateStatus;
    }

    public void setCertificateStatus(String certificateStatus) {
        this.certificateStatus = certificateStatus;
    }
}