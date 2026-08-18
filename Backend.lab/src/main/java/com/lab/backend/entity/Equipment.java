package com.lab.backend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.lab.backend.enums.EquipmentStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "equipment")
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Equipment name is required")
    private String name;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @Min(value = 1, message = "Quantity must be greater than 0")
    private int quantity;

    @Min(value = 0, message = "Available quantity cannot be negative")
    private int availableQuantity;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    private EquipmentStatus status;

    // Relationship with Laboratory
    @ManyToOne
    @JoinColumn(name = "laboratory_id")
    @JsonBackReference
    private Laboratory laboratory;

    public Equipment() {
    }

    public Equipment(
            Long id,
            String name,
            String description,
            String category,
            int quantity,
            int availableQuantity,
            EquipmentStatus status,
            Laboratory laboratory) {

        this.id = id;
        this.name = name;
        this.description = description;
        this.category = category;
        this.quantity = quantity;
        this.availableQuantity = availableQuantity;
        this.status = status;
        this.laboratory = laboratory;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public int getAvailableQuantity() {
        return availableQuantity;
    }

    public void setAvailableQuantity(int availableQuantity) {
        this.availableQuantity = availableQuantity;
    }

    public EquipmentStatus getStatus() {
        return status;
    }

    public void setStatus(EquipmentStatus status) {
        this.status = status;
    }

    public Laboratory getLaboratory() {
        return laboratory;
    }

    public void setLaboratory(Laboratory laboratory) {
        this.laboratory = laboratory;
    }
}