package com.lrplatform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SharingAnalyticsResponse {
    private long totalSharedEquipment;
    private long activeSharedEquipment;
    private long totalPartnerships;
    private long activePartnerships;
    private long totalExternalBookings;
    private long pendingExternalBookings;
    private long approvedExternalBookings;
    private long rejectedExternalBookings;
    private BigDecimal totalApprovedRevenue;
}
