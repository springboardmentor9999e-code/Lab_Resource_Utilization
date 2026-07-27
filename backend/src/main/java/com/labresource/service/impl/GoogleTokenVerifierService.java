package com.labresource.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Verifies Google ID tokens via Google's tokeninfo endpoint.
 * Dependency-free: uses a plain RestTemplate, no spring-oauth2-client.
 */
@Service
@Slf4j
public class GoogleTokenVerifierService {

    private static final String TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo?id_token={token}";

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.oauth.google-client-id:}")
    private String googleClientId;

    /**
     * Returns the verified token claims (email, given_name, family_name, sub, ...).
     * Throws RuntimeException("Invalid Google token") on any failure.
     */
    public Map<String, Object> verify(String idToken) {
        Map<String, Object> claims;
        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    TOKEN_INFO_URL,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<Map<String, Object>>() {},
                    idToken);
            claims = response.getBody();
        } catch (Exception e) {
            log.warn("Google tokeninfo call failed: {}", e.getMessage());
            throw new RuntimeException("Invalid Google token");
        }

        if (claims == null || claims.get("email") == null) {
            throw new RuntimeException("Invalid Google token");
        }

        Object emailVerified = claims.get("email_verified");
        boolean verified = "true".equalsIgnoreCase(String.valueOf(emailVerified));
        if (!verified) {
            throw new RuntimeException("Invalid Google token");
        }

        if (googleClientId != null && !googleClientId.isBlank()) {
            String aud = String.valueOf(claims.get("aud"));
            if (!googleClientId.equals(aud)) {
                log.warn("Google token aud mismatch: expected {}, got {}", googleClientId, aud);
                throw new RuntimeException("Invalid Google token");
            }
        } else {
            log.warn("app.oauth.google-client-id is not configured — skipping aud validation of Google ID token");
        }

        return claims;
    }
}
