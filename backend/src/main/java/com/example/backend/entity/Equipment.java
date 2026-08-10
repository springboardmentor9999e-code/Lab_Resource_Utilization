package com.example.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "equipment")
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "equipment_name", nullable = false)
    private String equipmentName;

    @Column(name = "category")
    private String category;

    @Column(name = "description")
    private String description;

    @Column(name = "status")
    private String status;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "available_quantity")
    private Integer availableQuantity;

    @Column(name = "institution_id")
    private Integer institutionId;

    @Column(name = "laboratory_id")
    private Integer laboratoryId;

    @Column(name = "image")
    private String image;

    @Column(name = "document_url")
    private String documentUrl;

    public Equipment() {
    }

    public Equipment(Integer id, String equipmentName, String category,
                     String description, String status,
                     Integer quantity, Integer availableQuantity,
                     Integer institutionId, Integer laboratoryId,
                     String image, String documentUrl) {

        this.id = id;
        this.equipmentName = equipmentName;
        this.category = category;
        this.description = description;
        this.status = status;
        this.quantity = quantity;
        this.availableQuantity = availableQuantity;
        this.institutionId = institutionId;
        this.laboratoryId = laboratoryId;
        this.image = image;
        this.documentUrl = documentUrl;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getAvailableQuantity() {
        return availableQuantity;
    }

    public void setAvailableQuantity(Integer availableQuantity) {
        this.availableQuantity = availableQuantity;
    }

    public Integer getInstitutionId() {
        return institutionId;
    }

    public void setInstitutionId(Integer institutionId) {
        this.institutionId = institutionId;
    }

    public Integer getLaboratoryId() {
        return laboratoryId;
    }

    public void setLaboratoryId(Integer laboratoryId) {
        this.laboratoryId = laboratoryId;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;

    }

    public String getDocumentUrl() {
        return documentUrl;
    }

    public void setDocumentUrl(String documentUrl) {
        this.documentUrl = documentUrl;
    }
}