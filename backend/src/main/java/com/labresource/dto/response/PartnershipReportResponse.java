package com.labresource.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * Sharing analytics and partnership reporting (spec Module 5(vi)).
 *
 * Reports per counterparty rather than per request, because the question a lab or institution
 * admin is actually asking is "which of our partnerships are working?" — a flat list of requests
 * cannot answer that.
 *
 * Inbound and outbound are kept separate throughout. An institution that lends heavily but borrows
 * nothing has a very different relationship from one that does the reverse, and netting the two
 * into a single number hides exactly the imbalance worth knowing about.
 */
@Data
@Builder
public class PartnershipReportResponse {

    private Long institutionId;
    private String institutionName;
    private int days;

    // ---- Totals across all partners ----
    private int totalPartners;
    private long inboundRequests;   // others asking to use our equipment
    private long outboundRequests;  // us asking to use theirs
    private long inboundApproved;
    private long outboundApproved;
    private double inboundHours;
    private double outboundHours;
    private BigDecimal inboundRevenue;  // fees others owe us
    private BigDecimal outboundCost;    // fees we owe others

    /** inboundHours - outboundHours. Positive means we are a net lender. */
    private double netHours;
    /** LENDER | BORROWER | BALANCED */
    private String posture;

    private int activeAgreements;

    private List<Partner> partners;
    private List<String> insights;

    @Data
    @Builder
    public static class Partner {
        private Long institutionId;
        private String institutionName;

        private long inboundRequests;
        private long outboundRequests;
        private long inboundApproved;
        private long outboundApproved;
        /** Approvals as a share of requests they sent us, 0-100. */
        private double inboundApprovalRate;
        /** Approvals as a share of requests we sent them, 0-100. */
        private double outboundApprovalRate;

        private double inboundHours;
        private double outboundHours;
        private BigDecimal inboundRevenue;
        private BigDecimal outboundCost;

        /** Whether a live agreement governs each direction. */
        private boolean hasInboundAgreement;
        private boolean hasOutboundAgreement;

        /** Equipment most exchanged with this partner. */
        private List<String> topEquipment;
    }
}
