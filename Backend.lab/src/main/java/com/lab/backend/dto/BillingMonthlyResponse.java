package com.lab.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BillingMonthlyResponse {
    private Integer year;
    private Integer month;
    private BigDecimal totalCost;
    private String monthYear;
}
