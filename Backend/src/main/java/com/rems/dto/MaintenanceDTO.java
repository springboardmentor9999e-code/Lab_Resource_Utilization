package com.rems.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

public class MaintenanceDTO {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        private Long equipmentId;
        private Integer quantity;
        private Boolean isAll;
        private Instant startTime;
        private String reason;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long recordId;
        private Long equipmentId;
        private String equipmentName;
        private String category;
        private String labName;
        private String location;
        private Integer quantity;
        private Integer totalAmount;
        private Instant startTime;
        private Instant endTime;
        private String status;
        private Double utilizationRate;
        private Boolean maintenanceNeeded;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateTimeRequest {
        private Instant startTime;
    }
}
