package com.rems.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponse {
    private String message;
    private Long bookingId;
    private EquipmentResponse equipment;
    private Long userId;
    private String userName;
    private String userEmail;
    private Instant startTime;
    private Instant endTime;
    private String purpose;
    private String status;
    private Long approvedById;
    private String approvedByName;
    private String approvalRemarks;
    private Instant approvedAt;
    private Instant createdAt;
}
