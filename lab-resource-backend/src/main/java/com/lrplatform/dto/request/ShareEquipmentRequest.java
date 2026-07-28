package com.lrplatform.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShareEquipmentRequest {
    private Long equipmentId;
    private BigDecimal hourlyRate;
    private BigDecimal dailyRate;
    private BigDecimal securityDeposit;
}
