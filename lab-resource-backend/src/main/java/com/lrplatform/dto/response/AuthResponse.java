package com.lrplatform.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String accessToken;
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String refreshToken;
    private String tokenType;
    private String role;
    private String email;
    private String fullName;
    private Long userId;
    private Long institutionId;
    private Long departmentId;
}
