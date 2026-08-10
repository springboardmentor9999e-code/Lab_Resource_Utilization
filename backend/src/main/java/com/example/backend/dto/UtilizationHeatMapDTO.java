package com.example.backend.dto;

public class UtilizationHeatMapDTO {

    private String equipmentName;
    private long bookingCount;


    public UtilizationHeatMapDTO(
            String equipmentName,
            long bookingCount
    ) {
        this.equipmentName = equipmentName;
        this.bookingCount = bookingCount;
    }


    public String getEquipmentName() {
        return equipmentName;
    }


    public long getBookingCount() {
        return bookingCount;
    }
}