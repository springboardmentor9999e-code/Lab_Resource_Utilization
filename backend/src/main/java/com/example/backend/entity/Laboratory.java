package com.example.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "laboratories")
public class Laboratory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "lab_id")
    private Integer labId;

    @Column(name = "lab_name", nullable = false)
    private String labName;

    @Column(name = "institution_id")
    private Integer institutionId;

    public Laboratory() {
    }

    public Laboratory(Integer labId, String labName, Integer institutionId) {
        this.labId = labId;
        this.labName = labName;
        this.institutionId = institutionId;
    }

    public Integer getLabId() {
        return labId;
    }

    public void setLabId(Integer labId) {
        this.labId = labId;
    }

    public String getLabName() {
        return labName;
    }

    public void setLabName(String labName) {
        this.labName = labName;
    }

    public Integer getInstitutionId() {
        return institutionId;
    }

    public void setInstitutionId(Integer institutionId) {
        this.institutionId = institutionId;
    }
}