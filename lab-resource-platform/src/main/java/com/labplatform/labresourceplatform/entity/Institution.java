package com.labplatform.labresourceplatform.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name="institutions")
public class Institution {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="institution_id")
    private Long institutionId;

    @Column(name="institution_name", nullable=false, length=100)
    private String institutionName;

    @Column(name="address")
    private String address;

    @Column(name="contact_email", length=100)
    private String contactEmail;

    @Column(name="contact_phone", length=15)
    private String contactPhone;
}
