package com.labresource.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Inter-institution invoice (EER: invoice). Generated from an APPROVED sharing
 * request with a usage fee; billed by the equipment-owning institution.
 */
@Entity
@Table(name = "invoice", indexes = {
    @Index(name = "idx_invoice_from_institution", columnList = "from_institution_id"),
    @Index(name = "idx_invoice_to_institution", columnList = "to_institution_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "invoice_id")
    private Long invoiceId;

    @Column(name = "invoice_number", unique = true, length = 30)
    private String invoiceNumber; // INV-<year>-<zero-padded id>

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sharing_request_id", unique = true)
    private SharingRequest sharingRequest;

    // Issuer (equipment owner) — receives the payment
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_institution_id", nullable = false)
    private Institution fromInstitution;

    // Billed institution (requester's) — pays
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_institution_id", nullable = false)
    private Institution toInstitution;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 20)
    private String status; // PENDING | PAID | CANCELLED

    @Column(name = "issued_date", nullable = false)
    private LocalDate issuedDate;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "paid_date")
    private LocalDate paidDate;

    @Column(length = 500)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private AppUser createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        if (status == null) status = "PENDING";
        if (issuedDate == null) issuedDate = LocalDate.now();
        if (dueDate == null) dueDate = issuedDate.plusDays(30);
    }
}
