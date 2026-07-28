package com.lrplatform.controller;

import com.lrplatform.repository.AuditLogRepository;
import com.lrplatform.security.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuditLogController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class AuditLogControllerTest {

    @Autowired MockMvc mockMvc;

    @MockBean AuditLogRepository auditLogRepository;
    @MockBean JwtTokenProvider jwtTokenProvider;
    @MockBean CustomUserDetailsService customUserDetailsService;
    @MockBean CustomOAuth2UserService customOAuth2UserService;
    @MockBean OAuth2AuthenticationSuccessHandler oauth2SuccessHandler;
    @MockBean CookieOAuth2AuthorizationRequestRepository cookieRepository;

    @Test
    void listAuditLogs_returnsList() throws Exception {
        when(auditLogRepository.findAll()).thenReturn(List.of());
        mockMvc.perform(get("/audit-logs")).andExpect(status().isOk()).andExpect(jsonPath("$").isArray());
    }

    @Test
    void listAuditLogsByModule_returnsList() throws Exception {
        when(auditLogRepository.findByModuleOrderByActionTimeDesc("AUTH")).thenReturn(List.of());
        mockMvc.perform(get("/audit-logs/module/AUTH")).andExpect(status().isOk()).andExpect(jsonPath("$").isArray());
    }
}
