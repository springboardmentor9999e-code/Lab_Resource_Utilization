package com.lrplatform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponse {
    private Long id;
    private Long equipmentId;
    private String equipmentName;
    private String equipmentCode;
    private Long userId;
    private String userFullName;
    private String userEmail;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private String status;
    private Long approvedById;
    private String approvedByName;
    private LocalDateTime approvedAt;
    private String remarks;
    private String userRole;
    private String userInstitutionName;
    private String userDepartmentName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
