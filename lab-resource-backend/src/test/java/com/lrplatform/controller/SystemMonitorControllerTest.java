package com.lrplatform.controller;

import com.lrplatform.dto.response.SystemHealthResponse;
import com.lrplatform.security.*;
import com.lrplatform.service.SystemMonitorService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SystemMonitorController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class SystemMonitorControllerTest {

    @Autowired MockMvc mockMvc;

    @MockBean SystemMonitorService systemMonitorService;
    @MockBean JwtTokenProvider jwtTokenProvider;
    @MockBean CustomUserDetailsService customUserDetailsService;
    @MockBean CustomOAuth2UserService customOAuth2UserService;
    @MockBean OAuth2AuthenticationSuccessHandler oauth2SuccessHandler;
    @MockBean CookieOAuth2AuthorizationRequestRepository cookieRepository;

    @Test
    void healthCheck_returnsHealth() throws Exception {
        SystemHealthResponse health = new SystemHealthResponse();
        health.setStatus("UP");
        when(systemMonitorService.getSystemHealth()).thenReturn(health);

        mockMvc.perform(get("/admin/system/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }
}
