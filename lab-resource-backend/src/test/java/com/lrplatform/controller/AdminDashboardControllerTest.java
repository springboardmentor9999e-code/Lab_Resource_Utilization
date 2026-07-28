package com.lrplatform.controller;

import com.lrplatform.dto.response.AdminDashboardStats;
import com.lrplatform.repository.AuditLogRepository;
import com.lrplatform.security.*;
import com.lrplatform.service.AdminDashboardService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminDashboardController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class AdminDashboardControllerTest {

    @Autowired MockMvc mockMvc;

    @MockBean AdminDashboardService adminDashboardService;
    @MockBean AuditLogRepository auditLogRepository;
    @MockBean JwtTokenProvider jwtTokenProvider;
    @MockBean CurrentUserUtil currentUserUtil;
    @MockBean CustomUserDetailsService customUserDetailsService;
    @MockBean CustomOAuth2UserService customOAuth2UserService;
    @MockBean OAuth2AuthenticationSuccessHandler oauth2SuccessHandler;
    @MockBean CookieOAuth2AuthorizationRequestRepository cookieRepository;

    @Test
    void getDashboardStats_returnsStats() throws Exception {
        AdminDashboardStats stats = AdminDashboardStats.builder().totalUsers(5).totalEquipment(6).totalBookings(8).build();
        when(adminDashboardService.getDashboardStats()).thenReturn(stats);

        com.lrplatform.model.entity.User systemAdmin = com.lrplatform.model.entity.User.builder()
                .id(1L).role(com.lrplatform.model.enums.UserRole.SYSTEM_ADMIN).build();
        when(currentUserUtil.getCurrentUser(any())).thenReturn(systemAdmin);

        mockMvc.perform(get("/admin/dashboard/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").value(5))
                .andExpect(jsonPath("$.totalEquipment").value(6));
    }

    @Test
    void getRecentActivity_returnsList() throws Exception {
        when(auditLogRepository.findTop20ByOrderByActionTimeDesc()).thenReturn(List.of());

        mockMvc.perform(get("/admin/dashboard/recent-activity"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
