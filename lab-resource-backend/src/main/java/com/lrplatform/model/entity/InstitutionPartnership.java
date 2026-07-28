package com.lrplatform.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "institution_partnerships")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InstitutionPartnership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_a_id", nullable = false)
    private Institution institutionA;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_b_id", nullable = false)
    private Institution institutionB;

    @Column(name = "agreement_start", nullable = false)
    private LocalDate agreementStart;

    @Column(name = "agreement_end", nullable = false)
    private LocalDate agreementEnd;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "ACTIVE";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
