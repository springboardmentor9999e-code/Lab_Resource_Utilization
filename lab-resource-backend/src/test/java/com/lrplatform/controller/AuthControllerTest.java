package com.lrplatform.controller;

import com.lrplatform.dto.response.AuthResponse;
import com.lrplatform.security.*;
import com.lrplatform.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired MockMvc mockMvc;

    @MockBean AuthService authService;
    @MockBean JwtTokenProvider jwtTokenProvider;
    @MockBean CustomUserDetailsService customUserDetailsService;
    @MockBean CustomOAuth2UserService customOAuth2UserService;
    @MockBean OAuth2AuthenticationSuccessHandler oauth2SuccessHandler;
    @MockBean CookieOAuth2AuthorizationRequestRepository cookieRepository;

    @Test
    void login_validCredentials_returnsToken() throws Exception {
        AuthResponse authResponse = AuthResponse.builder()
                .accessToken("test-access-token")
                .refreshToken("test-refresh-token")
                .tokenType("Bearer")
                .role("SYSTEM_ADMIN")
                .email("admin@demouniversity.edu")
                .fullName("Admin System")
                .userId(1L)
                .build();
        when(authService.login(any())).thenReturn(authResponse);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content("{\"email\":\"admin@demouniversity.edu\",\"password\":\"Password@123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("test-access-token"))
                .andExpect(jsonPath("$.role").value("SYSTEM_ADMIN"))
                .andExpect(jsonPath("$.email").value("admin@demouniversity.edu"));
    }

    @Test
    void login_invalidCredentials_throwsException() throws Exception {
        when(authService.login(any())).thenThrow(new RuntimeException("Invalid credentials"));

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content("{\"email\":\"admin@demouniversity.edu\",\"password\":\"wrong\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_missingFields_returns400() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_invalidEmail_returns400() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content("{\"email\":\"not-an-email\",\"password\":\"Password@123\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_validRequest_returns201() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content("{\"firstName\":\"Test\",\"lastName\":\"User\",\"email\":\"test@test.com\",\"password\":\"Test@123456\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Registration successful"));
    }

    @Test
    void register_missingFields_returns400() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content("{\"firstName\":\"Test\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void refreshToken_validToken_returnsNewToken() throws Exception {
        AuthResponse authResponse = AuthResponse.builder()
                .accessToken("new-access-token")
                .refreshToken("new-refresh-token")
                .build();
        when(authService.refreshToken(anyString())).thenReturn(authResponse);

        mockMvc.perform(post("/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content("{\"refreshToken\":\"valid-refresh-token\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("new-access-token"));
    }

    @Test
    void refreshToken_missingToken_returns400() throws Exception {
        mockMvc.perform(post("/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void logout_returns200() throws Exception {
        mockMvc.perform(post("/auth/logout")
                        .header("X-Refresh-Token", "some-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logged out successfully"));
    }

    @Test
    void forgotPassword_validEmail_returns200() throws Exception {
        mockMvc.perform(post("/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content("{\"email\":\"admin@demouniversity.edu\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password reset email sent"));
    }

    @Test
    void forgotPassword_invalidEmail_returns400() throws Exception {
        mockMvc.perform(post("/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content("{\"email\":\"not-valid\"}"))
                .andExpect(status().isBadRequest());
    }
}
