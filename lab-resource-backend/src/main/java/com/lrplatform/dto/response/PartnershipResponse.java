package com.lrplatform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartnershipResponse {
    private Long id;
    private Long institutionAId;
    private String institutionAName;
    private Long institutionBId;
    private String institutionBName;
    private LocalDate agreementStart;
    private LocalDate agreementEnd;
    private String status;
    private LocalDateTime createdAt;
}
