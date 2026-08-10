package com.example.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {


    private static final String SECRET =
            "mysecretkeymysecretkeymysecretkey12345";


    private final SecretKey key =
            Keys.hmacShaKeyFor(
                    SECRET.getBytes(StandardCharsets.UTF_8)
            );



    // Extract username(email) from token
    public String extractUsername(String token) {

        return extractClaim(
                token,
                Claims::getSubject
        );
    }



    // Extract userId from token
    public Integer extractUserId(String token) {

        Claims claims = extractAllClaims(token);

        return claims.get(
                "userId",
                Integer.class
        );
    }



    // Extract expiration date
    public Date extractExpiration(String token) {

        return extractClaim(
                token,
                Claims::getExpiration
        );
    }



    // Generic claim extractor
    public <T> T extractClaim(
            String token,
            Function<Claims, T> claimsResolver) {


        Claims claims = extractAllClaims(token);

        return claimsResolver.apply(claims);
    }



    // Read all claims
    private Claims extractAllClaims(String token) {

        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }



    // Generate JWT token with userId
    public String generateToken(
            UserDetails userDetails,
            Integer userId) {


        return Jwts.builder()

                .subject(
                        userDetails.getUsername()
                )

                .claim(
                        "userId",
                        userId
                )

                .issuedAt(
                        new Date()
                )

                .expiration(
                        new Date(
                                System.currentTimeMillis()
                                        + 86400000
                        )
                )

                .signWith(key)

                .compact();
    }



    // Check token expiry
    private boolean isTokenExpired(String token) {

        return extractExpiration(token)
                .before(new Date());
    }



    // Validate token
    public boolean isTokenValid(
            String token,
            UserDetails userDetails) {


        String username =
                extractUsername(token);


        return username.equals(
                userDetails.getUsername()
        )
                &&
                !isTokenExpired(token);
    }
}