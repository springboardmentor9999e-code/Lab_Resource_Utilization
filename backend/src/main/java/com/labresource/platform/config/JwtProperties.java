package com.labresource.platform.config;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "application.security.jwt")
public record JwtProperties(
        @NotBlank(message = "JWT secret key is required")
        String secretKey,

        @Min(value = 60000, message = "JWT expiration must be at least 60000 ms")
        long expirationMs
) {
}
