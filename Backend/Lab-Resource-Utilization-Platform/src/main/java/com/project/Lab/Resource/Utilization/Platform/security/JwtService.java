package com.project.Lab.Resource.Utilization.Platform.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    private static final String SECRET_KEY =
            "LabResourceUtilizationPlatformSecretKey123456789";

    private static final long JWT_EXPIRATION =
            1000L * 60 * 60 * 24; // 24 Hours

    // ==========================================================
    // GENERATE TOKEN
    // ==========================================================

    public String generateToken(String email) {

        return generateToken(new HashMap<>(), email);

    }

    public String generateToken(
            Map<String, Object> extraClaims,
            String email
    ) {

        return Jwts.builder()

                .setClaims(extraClaims)

                .setSubject(email)

                .setIssuedAt(new Date())

                .setExpiration(
                        new Date(
                                System.currentTimeMillis() + JWT_EXPIRATION
                        )
                )

                .signWith(
                        SignatureAlgorithm.HS256,
                        SECRET_KEY
                )

                .compact();
    }

    // ==========================================================
    // EXTRACT EMAIL
    // ==========================================================

    public String extractEmail(String token) {

        return extractClaim(
                token,
                Claims::getSubject
        );

    }

    // ==========================================================
    // EXTRACT EXPIRATION
    // ==========================================================

    public Date extractExpiration(String token) {

        return extractClaim(
                token,
                Claims::getExpiration
        );

    }

    // ==========================================================
    // EXTRACT CLAIM
    // ==========================================================

    public <T> T extractClaim(
            String token,
            Function<Claims, T> claimsResolver
    ) {

        Claims claims = Jwts.parser()

                .setSigningKey(SECRET_KEY)

                .build()

                .parseClaimsJws(token)

                .getBody();

        return claimsResolver.apply(claims);

    }

    // ==========================================================
    // TOKEN EXPIRED
    // ==========================================================

    public boolean isTokenExpired(
            String token
    ) {

        return extractExpiration(token)
                .before(new Date());

    }

    // ==========================================================
    // TOKEN VALIDATION
    // ==========================================================

    public boolean isTokenValid(
            String token,
            String email
    ) {

        String extractedEmail =
                extractEmail(token);

        return extractedEmail.equals(email)
                && !isTokenExpired(token);

    }

}