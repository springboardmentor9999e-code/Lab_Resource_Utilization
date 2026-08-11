package com.lrplatform.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OAuth2SuccessRequest {
    @NotBlank
    private String accessToken;
    
    @NotBlank
    private String refreshToken;
}
