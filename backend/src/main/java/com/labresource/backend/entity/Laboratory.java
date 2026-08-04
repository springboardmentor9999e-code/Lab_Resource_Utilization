package com.labresource.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "laboratories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Laboratory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "lab_id")
    private Long labId;

    @Column(name = "lab_name", nullable = false, length = 100)
    private String labName;

    @Column(name = "lab_code", nullable = false, unique = true, length = 20)
    private String labCode;

    @Column(length = 100)
    private String location;

    @Column
    private Integer capacity;

    @Column(length = 30)
    private String status;
    @ManyToOne
        @JoinColumn(name = "institution_id")
        private Institution institution;
}