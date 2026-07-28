package com.lrplatform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SharedEquipmentResponse {
    private Long id;
    private Long equipmentId;
    private String equipmentName;
    private String equipmentCode;
    private String labName;
    private String institutionName;
    private BigDecimal hourlyRate;
    private BigDecimal dailyRate;
    private BigDecimal securityDeposit;
    private String sharingStatus;
    private LocalDateTime createdAt;
}
