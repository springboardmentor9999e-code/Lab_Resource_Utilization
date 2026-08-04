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
        return costPerHour;
    }

    public void setCostPerHour(Double costPerHour) {
        this.costPerHour = costPerHour;
    }
}