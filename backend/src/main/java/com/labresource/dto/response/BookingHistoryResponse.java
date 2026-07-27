package com.labresource.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class BookingHistoryResponse {
    private Long historyId;
    private String oldStatus; // null for the creation entry
    private String newStatus;
    private String changedBy;
    private String remarks;
    private LocalDateTime changedAt;
}
