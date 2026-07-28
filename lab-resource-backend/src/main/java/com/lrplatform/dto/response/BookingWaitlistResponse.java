package com.lrplatform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingWaitlistResponse {
    private Long id;
    private Long equipmentId;
    private String equipmentName;
    private String equipmentCode;
    private Long userId;
    private String userFullName;
    private String userEmail;
    private String userRole;
    private Integer position;
    private Boolean active;
    private LocalDateTime createdAt;
}
