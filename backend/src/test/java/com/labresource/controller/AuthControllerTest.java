package com.labresource.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.labresource.config.SecurityConfig;
import com.labresource.dto.request.LoginRequest;
import com.labresource.dto.request.RegisterRequest;
import com.labresource.dto.response.ApiResponse;
import com.labresource.dto.response.AuthResponse;
import com.labresource.security.CustomUserDetailsService;
import com.labresource.security.JwtAuthenticationFilter;
import com.labresource.security.JwtService;
import com.labresource.service.interfaces.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Web slice tests for the public auth endpoints: request validation,
 * success payloads and error mapping through the GlobalExceptionHandler.
 */
@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class AuthControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockitoBean private AuthService authService;
    @MockitoBean private JwtService jwtService;
    @MockitoBean private CustomUserDetailsService userDetailsService;

    @Test
    void login_returnsTokens() throws Exception {
        when(authService.loginUser(any(LoginRequest.class))).thenReturn(
                AuthResponse.builder()
                        .accessToken("jwt-token").refreshToken("refresh-token")
                        .username("student").roles(Set.of("STUDENT")).build());

        LoginRequest request = new LoginRequest();
        request.setUsername("student");
        request.setPassword("student123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("jwt-token"))
                .andExpect(jsonPath("$.username").value("student"));
    }

    @Test
    void login_badCredentialsMapsTo401() throws Exception {
        when(authService.loginUser(any(LoginRequest.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        LoginRequest request = new LoginRequest();
        request.setUsername("student");
        request.setPassword("wrong");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid username or password"));
    }

    @Test
    void register_success() throws Exception {
        when(authService.registerUser(any(RegisterRequest.class)))
                .thenReturn(new ApiResponse<>(true, "User registered successfully", null));

        RegisterRequest request = new RegisterRequest();
        request.setUsername("newuser");
        request.setEmail("new@test.local");
        request.setPassword("secret123");
        request.setFirstName("New");
        request.setLastName("User");
        request.setRoles(Set.of("STUDENT")); // roles is @NotEmpty on RegisterRequest

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void register_missingFieldsFailValidation() throws Exception {
        // No username/email/password — bean validation must reject before the service runs
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Validation failed"));
    }

    @Test
    void authEndpoints_arePublic_noTokenRequired() throws Exception {
        when(authService.forgotPassword(any()))
                .thenReturn(new ApiResponse<>(true, "OTP sent", null));

        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"sam@test.local\"}"))
                .andExpect(status().isOk());
    }
}
