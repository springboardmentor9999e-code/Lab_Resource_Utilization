package com.rems.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum EquipmentStatus {
    AVAILABLE("Available"),
    BOOKED("Booked"),
    MAINTENANCE("Maintenance"),
    OUT_OF_SERVICE("Out of Service");

    private final String value;

    EquipmentStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static EquipmentStatus fromValue(String value) {
        if (value == null || value.trim().isEmpty()) {
            return AVAILABLE;
        }
        for (EquipmentStatus status : EquipmentStatus.values()) {
            if (status.value.equalsIgnoreCase(value) || status.name().equalsIgnoreCase(value)) {
                return status;
            }
        }
        if ("Operational".equalsIgnoreCase(value)) {
            return AVAILABLE;
        }
        if ("Under Maintenance".equalsIgnoreCase(value)) {
            return MAINTENANCE;
        }
        return AVAILABLE;
    }
}
