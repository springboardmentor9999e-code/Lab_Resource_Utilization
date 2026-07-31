package com.project.Lab.Resource.Utilization.Platform.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {

            final String jwt = authHeader.substring(7);

            final String email = jwtService.extractEmail(jwt);

            if (email != null &&
                    SecurityContextHolder.getContext().getAuthentication() == null) {

                UserDetails userDetails =
                        customUserDetailsService.loadUserByUsername(email);

                if (jwtService.isTokenValid(jwt, userDetails.getUsername())) {

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authentication.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(authentication);

                    System.out.println("======================================");
                    System.out.println("JWT Authentication Success");
                    System.out.println("User : " + userDetails.getUsername());
                    System.out.println("Authorities : " + userDetails.getAuthorities());
                    System.out.println("Request : " + request.getMethod() + " " + request.getRequestURI());
                    System.out.println("======================================");
                }

            }

        } catch (Exception e) {

            SecurityContextHolder.clearContext();

            System.out.println("======================================");
            System.out.println("JWT Authentication Failed");
            System.out.println(e.getMessage());
            System.out.println("Request : " + request.getRequestURI());
            System.out.println("======================================");
        }

        filterChain.doFilter(request, response);
    }
}