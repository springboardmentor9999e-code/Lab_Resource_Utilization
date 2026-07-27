package com.labresource.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "equipment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "equipment_id")
    private Long equipmentId;

    @Column(name = "equipment_name", nullable = false, length = 150)
    private String equipmentName;

    @Column(name = "equipment_code", nullable = false, unique = true, length = 50)
    private String equipmentCode;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(length = 100)
    private String manufacturer;

    @Column(length = 100)
    private String model;

    @Column(name = "serial_number", length = 100)
    private String serialNumber;

    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    // AVAILABLE | IN_USE | RESERVED | UNDER_MAINTENANCE | OUT_OF_SERVICE | RETIRED | LOST
    @Column(nullable = false, length = 30)
    private String status;

    // Whether this equipment is listed for inter-institution sharing
    @Column(name = "is_shareable")
    private Boolean isShareable;

    @Column(name = "warranty_expiry")
    private LocalDate warrantyExpiry;

    @Column(length = 150)
    private String vendor;

    @Column(precision = 12, scale = 2)
    private BigDecimal cost;

    // Usage fee charged per hour for inter-institution shared access (null/0 = free)
    @Column(name = "hourly_rate", precision = 10, scale = 2)
    private BigDecimal hourlyRate;

    @Column(name = "current_location", length = 200)
    private String currentLocation;

    @Column(columnDefinition = "TEXT")
    private String description;

    // JSON string of key/value specification pairs, e.g. {"Processor":"i7","RAM":"16GB"}
    @Column(columnDefinition = "TEXT")
    private String specifications;

    // Comma-separated free-form tags, e.g. "high-voltage,shared,teaching-lab"
    @Column(columnDefinition = "TEXT")
    private String tags;

    @Column(name = "qr_code", length = 255)
    private String qrCode;

    @Column(name = "rfid_tag", length = 100)
    private String rfidTag;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lab_id")
    private Lab lab;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id")
    private Institution institution;

    @OneToMany(mappedBy = "equipment", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("isPrimary DESC, uploadedAt ASC")
    @Builder.Default
    private List<EquipmentImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "equipment", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("uploadedAt DESC")
    @Builder.Default
    private List<EquipmentDocument> documents = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "AVAILABLE";
        }
        if (isShareable == null) {
            isShareable = false;
        }
        if (qrCode == null) {
            // QR payload — encodes the equipment code; rendered as QR on the frontend
            qrCode = "LRP-EQ:" + equipmentCode;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
