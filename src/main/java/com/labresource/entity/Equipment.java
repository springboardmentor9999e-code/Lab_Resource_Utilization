package com.labresource.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

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
    private Long id;

    @Column(nullable = false)
    private String name;

    private String category;

    @Column(nullable = false)
    private String status;

    private Long institutionId;

    private String description;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String imageBase64;

    private Double cost;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}