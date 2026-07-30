package com.rems.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum BookingStatus {
    PENDING_APPROVAL("Pending Approval"),
    CONFIRMED("Confirmed"),
    IN_USE("In Use"),
    COMPLETED("Completed"),
    CANCELLED("Cancelled"),
    NO_SHOW("No Show");

    private final String value;

    BookingStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static BookingStatus fromValue(String value) {
        for (BookingStatus status : BookingStatus.values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown status: " + value);
    }
}
