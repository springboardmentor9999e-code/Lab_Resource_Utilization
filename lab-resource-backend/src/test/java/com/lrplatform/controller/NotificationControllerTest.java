package com.lrplatform.controller;

import com.lrplatform.security.*;
import com.lrplatform.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(NotificationController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class NotificationControllerTest {

    @Autowired MockMvc mockMvc;

    @MockBean NotificationService notificationService;
    @MockBean CurrentUserUtil currentUserUtil;
    @MockBean JwtTokenProvider jwtTokenProvider;
    @MockBean CustomUserDetailsService customUserDetailsService;
    @MockBean CustomOAuth2UserService customOAuth2UserService;
    @MockBean OAuth2AuthenticationSuccessHandler oauth2SuccessHandler;
    @MockBean CookieOAuth2AuthorizationRequestRepository cookieRepository;

    @Test
    void listNotifications_returnsList() throws Exception {
        when(currentUserUtil.getCurrentUserId(any())).thenReturn(1L);
        when(notificationService.getUserNotifications(1L)).thenReturn(List.of());
        mockMvc.perform(get("/notifications")).andExpect(status().isOk()).andExpect(jsonPath("$").isArray());
    }

    @Test
    void getUnreadCount_returnsCount() throws Exception {
        when(currentUserUtil.getCurrentUserId(any())).thenReturn(1L);
        when(notificationService.getUnreadCount(1L)).thenReturn(5L);
        mockMvc.perform(get("/notifications/unread-count")).andExpect(status().isOk()).andExpect(jsonPath("$.count").value(5));
    }

    @Test
    void markAllRead_returnsSuccess() throws Exception {
        when(currentUserUtil.getCurrentUserId(any())).thenReturn(1L);
        mockMvc.perform(put("/notifications/read-all")).andExpect(status().isOk()).andExpect(jsonPath("$.message").value("All notifications marked as read"));
    }
}
