package com.labresource.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "equipment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "equipment_id")
    private Long equipmentId;

    @Column(name = "equipment_name", nullable = false)
    private String equipmentName;

    @Column(nullable = false)
    private String category;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private Double cost;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "available_quantity", nullable = false)
    private Integer availableQuantity;

    @Column(nullable = false)
    private String status;

    // Store only image filename (e.g. microscope.jpg)
    @Column(name = "image")
    private String image;

    @ManyToOne
    @JoinColumn(name = "lab_id", nullable = false)
    private Laboratory laboratory;
}