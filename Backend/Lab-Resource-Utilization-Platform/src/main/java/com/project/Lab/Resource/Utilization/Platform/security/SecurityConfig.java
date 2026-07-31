package com.project.Lab.Resource.Utilization.Platform.security;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;


    // =========================================================
    // PASSWORD ENCODER
    // =========================================================

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


    // =========================================================
    // CORS CONFIGURATION
    // =========================================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        /*
         * Frontend origins allowed to access Spring Boot.
         *
         * Current Vite frontend:
         * http://localhost:8081
         *
         * 5173 is also included in case Vite later runs
         * on its default port.
         */
        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:8081",
                        "http://localhost:5173"
                )
        );

        /*
         * HTTP methods allowed from frontend.
         */
        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        /*
         * Headers frontend is allowed to send.
         *
         * Authorization is required for JWT.
         */
        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type",
                        "Accept",
                        "Origin",
                        "X-Requested-With",
                        "ngrok-skip-browser-warning"
                )
        );

        /*
         * Headers frontend is allowed to read.
         */
        configuration.setExposedHeaders(
                List.of(
                        "Authorization"
                )
        );

        /*
         * We use JWT Bearer tokens instead of cookies.
         */
        configuration.setAllowCredentials(false);

        /*
         * Cache browser preflight response for 1 hour.
         */
        configuration.setMaxAge(3600L);


        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        /*
         * Apply CORS configuration to every backend endpoint.
         */
        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }


    // =========================================================
    // SPRING SECURITY CONFIGURATION
    // =========================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

                // =================================================
                // ENABLE CORS
                // =================================================

                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource()
                        )
                )


                // =================================================
                // DISABLE CSRF
                // REST API uses stateless JWT authentication.
                // =================================================

                .csrf(csrf ->
                        csrf.disable()
                )


                // =================================================
                // API AUTHORIZATION RULES
                // =================================================

                .authorizeHttpRequests(auth -> auth


                        // -----------------------------------------
                        // CORS PREFLIGHT REQUESTS
                        // -----------------------------------------

                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        )
                        .permitAll()


                        // -----------------------------------------
                        // PUBLIC AUTH ENDPOINTS
                        // No JWT required
                        // -----------------------------------------

                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/register",
                                "/api/auth/test"
                        )
                        .permitAll()


                        // -----------------------------------------
                        // CURRENT LOGGED-IN USER
                        // JWT required
                        // -----------------------------------------

                        .requestMatchers(
                                "/api/auth/me"
                        )
                        .authenticated()
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/institutions"
                        )
                        .permitAll()


                        // -----------------------------------------
                        // EQUIPMENT APIs
                        // -----------------------------------------

                        .requestMatchers(
                                "/api/equipment/**"
                        )
                        .authenticated()
                        .requestMatchers("/api/dashboard/**")
                        .authenticated()


                        // -----------------------------------------
                        // BOOKING APIs
                        // -----------------------------------------

                        .requestMatchers(
                                "/api/bookings/**"
                        )
                        .authenticated()

                        .requestMatchers("/api/analytics/**")
                        .authenticated()
                        // -----------------------------------------
                        // RESEARCHER APIs
                        // -----------------------------------------

                        .requestMatchers(
                                "/api/researcher/**"
                        )
                        .hasRole("RESEARCHER")

                        .requestMatchers("/api/reports/**")
                        .authenticated()
                        // -----------------------------------------
                        // LAB TECHNICIAN APIs
                        // -----------------------------------------

                        .requestMatchers(
                                "/api/lab-technician/**"
                        )
                        .hasRole("LAB_TECHNICIAN")


                        // -----------------------------------------
                        // LAB MANAGER APIs
                        // -----------------------------------------

                        .requestMatchers(
                                "/api/lab-manager/**"
                        )
                        .hasRole("LAB_MANAGER")


                        // -----------------------------------------
                        // DEPARTMENT HEAD APIs
                        // -----------------------------------------

                        .requestMatchers(
                                "/api/department-head/**"
                        )
                        .hasRole("DEPARTMENT_HEAD")


                        // -----------------------------------------
                        // INSTITUTION ADMIN APIs
                        // -----------------------------------------

                        .requestMatchers(
                                "/api/institution-admin/**"
                        )
                        .hasRole("INSTITUTION_ADMIN")


                        // -----------------------------------------
                        // SYSTEM ADMIN APIs
                        // -----------------------------------------

                        .requestMatchers(
                                "/api/system-admin/**"
                        )
                        .hasRole("SYSTEM_ADMIN")


                        // -----------------------------------------
                        // STUDENT APIs
                        // -----------------------------------------

                        .requestMatchers(
                                "/api/student/**"
                        )
                        .hasRole("STUDENT")

                        .requestMatchers("/api/users/**")
                        .hasRole("SYSTEM_ADMIN")
                        // -----------------------------------------
                        // ALL OTHER ENDPOINTS
                        // Login required
                        // -----------------------------------------

                        .anyRequest()
                        .authenticated()
                )


                // =================================================
                // STATELESS SESSION
                // =================================================

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )


                // =================================================
                // JWT AUTHENTICATION FILTER
                // =================================================

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                )


                // =================================================
                // DISABLE DEFAULT SPRING LOGIN
                // =================================================

                .formLogin(form ->
                        form.disable()
                )


                // =================================================
                // DISABLE HTTP BASIC AUTH
                // =================================================

                .httpBasic(httpBasic ->
                        httpBasic.disable()
                );


        return http.build();

    }
}