package com.lrplatform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InstitutionResponse {
    private Long id;
    private String institutionCode;
    private String institutionName;
    private String email;
    private String phone;
    private String website;
    private String address;
    private String city;
    private String state;
    private String country;
    private String pincode;
    private String logoUrl;
    private Boolean status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
