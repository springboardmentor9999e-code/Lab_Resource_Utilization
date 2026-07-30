package com.rems.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstitutionResponse {
    private Long institutionId;
    private String name;
    private String type;
    private String address;
    private String contactEmail;
    private String contactPhone;
    private String status;
    private Instant createdAt;
}
