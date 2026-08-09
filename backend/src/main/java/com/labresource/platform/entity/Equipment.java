package com.labresource.platform.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(
        name = "equipment",
        indexes = {
                @Index(name = "idx_equipment_lab_id", columnList = "lab_id"),
                @Index(name = "idx_equipment_status", columnList = "status"),
                @Index(name = "idx_equipment_serial_number", columnList = "serial_number")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_equipment_serial_number", columnNames = "serial_number")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Equipment name is required")
    @Size(max = 150, message = "Equipment name must not exceed 150 characters")
    @Column(nullable = false, length = 150)
    private String name;

    @NotBlank(message = "Category is required")
    @Size(max = 100, message = "Category must not exceed 100 characters")
    @Column(nullable = false, length = 100)
    private String category;

    @NotBlank(message = "Manufacturer is required")
    @Size(max = 150, message = "Manufacturer must not exceed 150 characters")
    @Column(nullable = false, length = 150)
    private String manufacturer;

    @NotBlank(message = "Serial number is required")
    @Size(max = 100, message = "Serial number must not exceed 100 characters")
    @Column(name = "serial_number", nullable = false, unique = true, length = 100)
    private String serialNumber;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be greater than zero")
    @Column(nullable = false)
    private Integer quantity;

    @NotNull(message = "Available quantity is required")
    @PositiveOrZero(message = "Available quantity must not be negative")
    @Column(nullable = false)
    private Integer availableQuantity;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EquipmentStatus status;

    @NotNull(message = "Purchase date is required")
    @PastOrPresent(message = "Purchase date must not be in the future")
    @Column(nullable = false)
    private LocalDate purchaseDate;

    @NotNull(message = "Lab is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "lab_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_equipment_lab")
    )
    private Lab lab;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
