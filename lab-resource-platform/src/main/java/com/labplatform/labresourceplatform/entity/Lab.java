package com.labplatform.labresourceplatform.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "labs")
public class Lab {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "lab_id")
    private Long labId;

    @Column(name = "lab_name", nullable = false, length = 100)
    private String labName;

    @Column(name = "location")
    private String location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;
}
