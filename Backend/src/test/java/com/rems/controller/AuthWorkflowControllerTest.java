package com.rems.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rems.dto.LoginRequest;
import com.rems.dto.LoginResponse;
import com.rems.dto.RegisterRequest;
import com.rems.dto.RegisterResponse;
import com.rems.dto.UserResponse;
import com.rems.repository.BlacklistedTokenRepository;
import com.rems.security.JwtAuthFilter;
import com.rems.security.JwtUtil;
import com.rems.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuthController.class, excludeAutoConfiguration = {SecurityAutoConfiguration.class, UserDetailsServiceAutoConfiguration.class})
@AutoConfigureMockMvc(addFilters = false)
class AuthWorkflowControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private BlacklistedTokenRepository blacklistedTokenRepository;

    @Test
    void registerEndpoint_Success() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .name("Jane Doe")
                .email("jane@example.com")
                .password("password123")
                .roleId(1)
                .build();

        UserResponse userResponse = UserResponse.builder()
                .userId(1L)
                .name("Jane Doe")
                .email("jane@example.com")
                .roleName("Research/Student")
                .roleId(1)
                .build();

        RegisterResponse response = RegisterResponse.builder()
                .token("jwt-token-123")
                .user(userResponse)
                .build();

        when(authService.register(any(RegisterRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("jwt-token-123"))
                .andExpect(jsonPath("$.user.email").value("jane@example.com"));
    }

    @Test
    void loginEndpoint_Success() throws Exception {
        LoginRequest request = new LoginRequest("jane@example.com", "password123", 1);

        UserResponse userResponse = UserResponse.builder()
                .userId(1L)
                .name("Jane Doe")
                .email("jane@example.com")
                .roleName("Research/Student")
                .roleId(1)
                .build();

        LoginResponse response = LoginResponse.builder()
                .token("jwt-token-login")
                .user(userResponse)
                .build();

        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token-login"))
                .andExpect(jsonPath("$.user.email").value("jane@example.com"));
    }
}
