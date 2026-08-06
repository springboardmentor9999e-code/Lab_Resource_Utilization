package com.infosys.labresourceutilizationplatform.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth

                        // =========================
                        // Authentication
                        // =========================
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/profile/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/issues").hasAnyAuthority("STUDENT", "RESEARCHER")
                        .requestMatchers(HttpMethod.GET, "/api/issues").hasAnyAuthority("LAB_TECHNICIAN", "LAB_MANAGER", "SYSTEM_ADMIN", "INSTITUTION_ADMIN", "DEPARTMENT_HEAD", "STUDENT", "RESEARCHER")
                        .requestMatchers(HttpMethod.PUT, "/api/issues/**").hasAnyAuthority("LAB_TECHNICIAN", "LAB_MANAGER", "SYSTEM_ADMIN", "INSTITUTION_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/preventive").hasAuthority("LAB_MANAGER")
                        .requestMatchers(HttpMethod.GET, "/api/preventive").hasAnyAuthority("LAB_TECHNICIAN", "LAB_MANAGER", "DEPARTMENT_HEAD", "INSTITUTION_ADMIN", "SYSTEM_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/preventive/**").hasAuthority("LAB_TECHNICIAN")
                        .requestMatchers("/api/utilization/**").authenticated()
                        .requestMatchers("/api/dashboard/**").authenticated()

                        // =========================
                        // =========================
                        // Institution APIs
                        // =========================
                        .requestMatchers(HttpMethod.GET, "/api/institutions", "/api/institutions/**").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/institutions", "/api/institutions/**")
                        .hasAnyAuthority("SYSTEM_ADMIN", "INSTITUTION_ADMIN")

                        .requestMatchers(HttpMethod.PUT, "/api/institutions", "/api/institutions/**")
                        .hasAnyAuthority("SYSTEM_ADMIN", "INSTITUTION_ADMIN")

                        .requestMatchers(HttpMethod.DELETE, "/api/institutions", "/api/institutions/**")
                        .hasAnyAuthority("SYSTEM_ADMIN", "INSTITUTION_ADMIN")

                        // =========================
                        // Department APIs
                        // =========================
                        .requestMatchers(HttpMethod.GET, "/api/departments", "/api/departments/**").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/departments", "/api/departments/**")
                        .hasAnyAuthority("SYSTEM_ADMIN", "INSTITUTION_ADMIN")

                        .requestMatchers(HttpMethod.PUT, "/api/departments", "/api/departments/**")
                        .hasAnyAuthority("SYSTEM_ADMIN", "INSTITUTION_ADMIN")

                        .requestMatchers(HttpMethod.DELETE, "/api/departments", "/api/departments/**")
                        .hasAnyAuthority("SYSTEM_ADMIN", "INSTITUTION_ADMIN")

                        // =========================
                        // Laboratory APIs
                        // =========================
                        .requestMatchers(HttpMethod.GET, "/api/laboratories", "/api/laboratories/**")
                        .hasAnyAuthority(
                                "SYSTEM_ADMIN",
                                "INSTITUTION_ADMIN",
                                "DEPARTMENT_HEAD",
                                "LAB_MANAGER",
                                "LAB_TECHNICIAN",
                                "RESEARCHER",
                                "STUDENT"
                        )

                        .requestMatchers(HttpMethod.POST, "/api/laboratories", "/api/laboratories/**")
                        .hasAnyAuthority("SYSTEM_ADMIN", "INSTITUTION_ADMIN")

                        .requestMatchers(HttpMethod.PUT, "/api/laboratories", "/api/laboratories/**")
                        .hasAnyAuthority("SYSTEM_ADMIN", "INSTITUTION_ADMIN")

                        .requestMatchers(HttpMethod.DELETE, "/api/laboratories", "/api/laboratories/**")
                        .hasAnyAuthority("SYSTEM_ADMIN", "INSTITUTION_ADMIN")

                        // =========================
                        // Equipment APIs
                        // =========================
                        .requestMatchers(HttpMethod.GET, "/api/equipment", "/api/equipment/**")
                        .hasAnyAuthority(
                                "SYSTEM_ADMIN",
                                "INSTITUTION_ADMIN",
                                "DEPARTMENT_HEAD",
                                "LAB_MANAGER",
                                "LAB_TECHNICIAN",
                                "RESEARCHER",
                                "STUDENT"
                        )

                        .requestMatchers(HttpMethod.POST, "/api/equipment/*/calibration/complete").hasAuthority("LAB_TECHNICIAN")
                        .requestMatchers(HttpMethod.POST, "/api/equipment/*/license/renew").hasAuthority("LAB_TECHNICIAN")
                        .requestMatchers(HttpMethod.POST, "/api/equipment/*/certificate/renew").hasAuthority("LAB_TECHNICIAN")

                        .requestMatchers(HttpMethod.POST, "/api/equipment", "/api/equipment/**")
                        .hasAnyAuthority(
                                "SYSTEM_ADMIN",
                                "INSTITUTION_ADMIN",
                                "LAB_MANAGER"
                        )

                        .requestMatchers(HttpMethod.PUT, "/api/equipment", "/api/equipment/**")
                        .hasAnyAuthority(
                                "SYSTEM_ADMIN",
                                "INSTITUTION_ADMIN",
                                "LAB_MANAGER"
                        )

                        .requestMatchers(HttpMethod.DELETE, "/api/equipment", "/api/equipment/**")
                        .hasAnyAuthority(
                                "SYSTEM_ADMIN",
                                "INSTITUTION_ADMIN"
                        )

                        // =========================
                        // Booking APIs
                        // =========================
                        .requestMatchers(HttpMethod.GET, "/api/bookings", "/api/bookings/**")
                        .hasAnyAuthority(
                                "SYSTEM_ADMIN",
                                "INSTITUTION_ADMIN",
                                "DEPARTMENT_HEAD",
                                "LAB_MANAGER",
                                "LAB_TECHNICIAN",
                                "RESEARCHER",
                                "STUDENT"
                        )

                        .requestMatchers(HttpMethod.POST, "/api/bookings", "/api/bookings/**")
                        .hasAnyAuthority(
                                "STUDENT",
                                "RESEARCHER"
                        )

                        .requestMatchers(HttpMethod.PUT, "/api/bookings/*/cancel").authenticated()

                        .requestMatchers(HttpMethod.PUT, "/api/bookings", "/api/bookings/**")
                        .hasAnyAuthority(
                                "LAB_MANAGER",
                                "LAB_TECHNICIAN",
                                "INSTITUTION_ADMIN",
                                "SYSTEM_ADMIN"
                        )

                        .requestMatchers(HttpMethod.DELETE, "/api/bookings", "/api/bookings/**")
                        .hasAnyAuthority(
                                "LAB_MANAGER",
                                "INSTITUTION_ADMIN",
                                "SYSTEM_ADMIN"
                        )

                        // =========================
                        // Dashboard/Admin APIs
                        // =========================
                        .requestMatchers("/api/admin/pending-users", "/api/admin/approve/**", "/api/admin/reject/**")
                        .hasAnyAuthority("INSTITUTION_ADMIN", "SYSTEM_ADMIN")
                        .requestMatchers("/api/admin/users")
                        .hasAnyAuthority("INSTITUTION_ADMIN", "SYSTEM_ADMIN", "LAB_MANAGER", "DEPARTMENT_HEAD")

                        .requestMatchers("/api/student/**")
                        .hasAuthority("STUDENT")

                        .requestMatchers("/api/researcher/**")
                        .hasAuthority("RESEARCHER")

                        .requestMatchers("/api/technician/**")
                        .hasAuthority("LAB_TECHNICIAN")

                        .requestMatchers("/api/manager/**")
                        .hasAuthority("LAB_MANAGER")

                        .requestMatchers("/api/department/**")
                        .hasAuthority("DEPARTMENT_HEAD")

                        .requestMatchers("/api/institution/**")
                        .hasAuthority("INSTITUTION_ADMIN")

                        .requestMatchers("/api/system/**")
                        .hasAuthority("SYSTEM_ADMIN")

                        .anyRequest().authenticated()
                )

                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {

        return configuration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of("http://localhost:3000"));

        configuration.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "OPTIONS"
        ));

        configuration.setAllowedHeaders(List.of("*"));

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}