package com.project.Lab.Resource.Utilization.Platform.dto;

public class UtilizationPointDTO {

    private String day;
    private Long usage;

    public UtilizationPointDTO() {
    }

    public UtilizationPointDTO(String day, Long usage) {
        this.day = day;
        this.usage = usage;
    }

    public String getDay() {
        return day;
    }

    public void setDay(String day) {
        this.day = day;
    }

    public Long getUsage() {
        return usage;
    }

    public void setUsage(Long usage) {
        this.usage = usage;
    }
}