package com.example.hello.config;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import java.util.List;
import com.example.hello.security.JwtAuthenticationFilter;
import com.example.hello.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(CustomUserDetailsService userDetailsService,
                          JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.userDetailsService = userDetailsService;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());

        return provider;
    }


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
                .cors(cors -> {})
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth

                        // Login
                        .requestMatchers("/auth/login","/auth/register").permitAll()

                        // Role welcome pages (optional)
                        .requestMatchers("/admin")
                        .hasAuthority("SYSTEM_ADMIN")

                        .requestMatchers("/manager")
                        .hasAuthority("LAB_MANAGER")

                        .requestMatchers("/technician")
                        .hasAuthority("LAB_TECHNICIAN")

                        .requestMatchers("/researcher")
                        .hasAuthority("RESEARCHER")

                        .requestMatchers("/institution/**")
                        .hasAnyAuthority("SYSTEM_ADMIN", "INSTITUTION_ADMIN")

                        .requestMatchers("/department/**")
                        .hasAnyAuthority("SYSTEM_ADMIN", "INSTITUTION_ADMIN", "DEPARTMENT_HEAD")

                        .requestMatchers("/equipment/**")
                        .hasAnyAuthority("SYSTEM_ADMIN", "INSTITUTION_ADMIN", "LAB_MANAGER" ,"RESEARCHER")

                        .requestMatchers("/maintenance/**")
                        .hasAnyAuthority("SYSTEM_ADMIN", "LAB_MANAGER", "LAB_TECHNICIAN")

                        .requestMatchers("/booking/**")
                        .hasAnyAuthority("SYSTEM_ADMIN", "RESEARCHER")

                        // Everything else
                        .anyRequest().authenticated()
                )

                .authenticationProvider(authenticationProvider())

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of("http://localhost:3000"));

        configuration.setAllowedMethods(
                List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        configuration.setAllowedHeaders(
                List.of("*"));

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}