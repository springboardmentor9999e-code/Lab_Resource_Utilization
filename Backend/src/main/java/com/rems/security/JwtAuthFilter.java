package com.rems.security;

import com.rems.repository.BlacklistedTokenRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final BlacklistedTokenRepository blacklistedTokenRepository;

    public JwtAuthFilter(JwtUtil jwtUtil, BlacklistedTokenRepository blacklistedTokenRepository) {
        this.jwtUtil = jwtUtil;
        this.blacklistedTokenRepository = blacklistedTokenRepository;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                     @NonNull HttpServletResponse response,
                                     @NonNull FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            if (jwtUtil.isTokenValid(token) && !blacklistedTokenRepository.existsByJti(jwtUtil.extractJti(token))) {
                Claims claims = jwtUtil.extractClaims(token);
                String email = claims.getSubject();
                String roleName = claims.get("roleName", String.class);
                List<?> rawPermissions = claims.get("permissions", List.class);

                List<GrantedAuthority> authorities = new java.util.ArrayList<>();

                if (roleName != null) {
                    // "Lab Manager" -> ROLE_LAB_MANAGER, "Researcher / Student" -> ROLE_RESEARCHER_STUDENT
                    String authorityName = "ROLE_" + roleName
                            .replace(" / ", "_")
                            .replace(" ", "_")
                            .toUpperCase();
                    authorities.add(new SimpleGrantedAuthority(authorityName));
                }

                if (rawPermissions != null) {
                    for (Object perm : rawPermissions) {
                        authorities.add(new SimpleGrantedAuthority(perm.toString()));
                    }
                }

                var authToken = new UsernamePasswordAuthenticationToken(email, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}
