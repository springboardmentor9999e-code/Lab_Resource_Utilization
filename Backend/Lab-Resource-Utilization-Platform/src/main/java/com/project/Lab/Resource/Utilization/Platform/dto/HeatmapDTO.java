package com.project.Lab.Resource.Utilization.Platform.dto;

public class HeatmapDTO {

    private Integer equipmentId;
    private String equipmentName;
    private Long bookings;
    private Double utilization;

    public HeatmapDTO() {
    }

    public HeatmapDTO(Integer equipmentId,
                      String equipmentName,
                      Long bookings,
                      Double utilization) {

        this.equipmentId = equipmentId;
        this.equipmentName = equipmentName;
        this.bookings = bookings;
        this.utilization = utilization;
    }

    public Integer getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Integer equipmentId) {
        this.equipmentId = equipmentId;
    }

    public String getEquipmentName() {
        return equipmentName;
    }

    public void setEquipmentName(String equipmentName) {
        this.equipmentName = equipmentName;
    }

    public Long getBookings() {
        return bookings;
    }

    public void setBookings(Long bookings) {
        this.bookings = bookings;
    }

    public Double getUtilization() {
        return utilization;
    }

    public void setUtilization(Double utilization) {
        this.utilization = utilization;
    }
}