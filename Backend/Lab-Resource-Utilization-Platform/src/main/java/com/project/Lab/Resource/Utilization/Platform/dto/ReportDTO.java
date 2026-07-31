package com.project.Lab.Resource.Utilization.Platform.dto;

import java.time.LocalDateTime;

public class ReportDTO {

    private Long id;
    private String title;
    private String type;
    private LocalDateTime createdAt;
    private Long sizeBytes;

    public ReportDTO() {
    }

    public ReportDTO(Long id,
                     String title,
                     String type,
                     LocalDateTime createdAt,
                     Long sizeBytes) {

        this.id = id;
        this.title = title;
        this.type = type;
        this.createdAt = createdAt;
        this.sizeBytes = sizeBytes;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Long getSizeBytes() {
        return sizeBytes;
    }

    public void setSizeBytes(Long sizeBytes) {
        this.sizeBytes = sizeBytes;
    }
}