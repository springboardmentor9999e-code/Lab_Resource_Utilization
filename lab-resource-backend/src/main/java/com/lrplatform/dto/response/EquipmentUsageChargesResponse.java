package com.lrplatform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentUsageChargesResponse {
    private Long equipmentId;
    private String equipmentName;
    private String equipmentCode;
    private BigDecimal totalHours;
    private BigDecimal hourlyRate;
    private BigDecimal totalCharge;
    private int bookingCount;
}
