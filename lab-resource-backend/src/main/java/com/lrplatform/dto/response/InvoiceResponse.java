package com.lrplatform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceResponse {
    private Long id;
    private String invoiceNumber;
    private Long institutionId;
    private String institutionName;
    private Long bookingId;
    private String equipmentName;
    private String bookingUser;
    private BigDecimal totalAmount;
    private BigDecimal taxAmount;
    private BigDecimal amountPaid;
    private BigDecimal amountDue;
    private String paymentStatus;
    private LocalDate dueDate;
    private LocalDateTime generatedAt;
}
