package com.lrplatform.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceRequest {
    @NotNull(message = "Institution ID is required")
    private Long institutionId;
    
    private Long bookingId;
    
    @NotNull(message = "Total amount is required")
    private BigDecimal totalAmount;
    
    private BigDecimal taxAmount;
    
    @NotNull(message = "Due date is required")
    private LocalDate dueDate;
}
