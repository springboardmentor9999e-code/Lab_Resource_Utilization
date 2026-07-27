package com.labresource.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.Set;

@Data
@Builder
public class AuthResponse {
    
    private String accessToken;
    
    private String refreshToken;
    
    private String username;
    
    private Set<String> roles;
}