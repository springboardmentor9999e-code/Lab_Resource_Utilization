package com.lrplatform.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartnershipRequest {
    private Long institutionAId;
    private Long institutionBId;
    private LocalDate agreementStart;
    private LocalDate agreementEnd;
}
