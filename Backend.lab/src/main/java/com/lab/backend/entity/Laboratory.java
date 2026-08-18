package com.lab.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "laboratories")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Laboratory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String labName;
    private String location;
    private String description;
    private Integer capacity;
    private String status;
}
