package com.labresource.platform.dto;

public record AuthenticationResponse(
        String token,
        String tokenType,
        long expiresInMs,
        UserResponse user
) {

    public static AuthenticationResponse bearer(String token, long expiresInMs, UserResponse user) {
        return new AuthenticationResponse(token, "Bearer", expiresInMs, user);
    }
}
