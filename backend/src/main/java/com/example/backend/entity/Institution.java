package com.example.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "institutions")
public class Institution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "institution_id")
    private Integer institutionId;

    @Column(name = "institution_name", nullable = false)
    private String institutionName;

    @Column(name = "address", nullable = false)
    private String address;

    // Default Constructor
    public Institution() {
    }

    // Parameterized Constructor
    public Institution(Integer institutionId, String institutionName, String address) {
        this.institutionId = institutionId;
        this.institutionName = institutionName;
        this.address = address;
    }

    // Getters and Setters

    public Integer getInstitutionId() {
        return institutionId;
    }

    public void setInstitutionId(Integer institutionId) {
        this.institutionId = institutionId;
    }

    public String getInstitutionName() {
        return institutionName;
    }

    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    @Override
    public String toString() {
        return "Institution{" +
                "institutionId=" + institutionId +
                ", institutionName='" + institutionName + '\'' +
                ", address='" + address + '\'' +
                '}';
    }
}