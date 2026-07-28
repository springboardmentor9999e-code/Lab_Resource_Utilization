package com.lrplatform.controller;

import com.lrplatform.dto.response.BudgetSummaryResponse;
import com.lrplatform.dto.response.CostBreakdownResponse;
import com.lrplatform.dto.response.EquipmentLifecycleResponse;
import com.lrplatform.dto.response.UtilizationIntelligenceResponse;
import com.lrplatform.model.entity.Institution;
import com.lrplatform.model.entity.User;
import com.lrplatform.model.enums.UserRole;
import com.lrplatform.security.*;
import com.lrplatform.service.CostTrackingService;
import com.lrplatform.service.EquipmentLifecycleService;
import com.lrplatform.service.UtilizationIntelligenceService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CostController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class CostControllerTest {

    @Autowired MockMvc mockMvc;

    @MockBean CostTrackingService costTrackingService;
    @MockBean UtilizationIntelligenceService utilizationIntelligenceService;
    @MockBean EquipmentLifecycleService equipmentLifecycleService;
    @MockBean JwtTokenProvider jwtTokenProvider;
    @MockBean CustomUserDetailsService customUserDetailsService;
    @MockBean CustomOAuth2UserService customOAuth2UserService;
    @MockBean OAuth2AuthenticationSuccessHandler oauth2SuccessHandler;
    @MockBean CookieOAuth2AuthorizationRequestRepository cookieRepository;
    @MockBean CurrentUserUtil currentUserUtil;

    @BeforeEach
    void setUp() {
        User sysAdmin = User.builder()
                .id(1L)
                .role(UserRole.SYSTEM_ADMIN)
                .firstName("Admin")
                .lastName("User")
                .build();
        when(currentUserUtil.getCurrentUser(any(HttpServletRequest.class))).thenReturn(sysAdmin);
    }

    @Test
    void getCostBreakdown_validRequest_returnsResponse() throws Exception {
        CostBreakdownResponse response = new CostBreakdownResponse();
        when(costTrackingService.getCostBreakdown(any())).thenReturn(response);

        mockMvc.perform(post("/costs/breakdown")
                        .contentType("application/json")
                        .content("{\"institutionId\":1}"))
                .andExpect(status().isOk());
    }

    @Test
    void getBudgetSummary_returnsResponse() throws Exception {
        BudgetSummaryResponse response = new BudgetSummaryResponse();
        when(costTrackingService.getBudgetSummary()).thenReturn(response);
        mockMvc.perform(get("/costs/budget-summary")).andExpect(status().isOk());
    }

    @Test
    void getMonthlyRevenue_returnsResponse() throws Exception {
        when(costTrackingService.getMonthlyRevenue(anyInt())).thenReturn(List.of());
        mockMvc.perform(get("/costs/monthly-revenue/2025")).andExpect(status().isOk()).andExpect(jsonPath("$").isArray());
    }

    @Test
    void getUtilization_returnsResponse() throws Exception {
        UtilizationIntelligenceResponse response = new UtilizationIntelligenceResponse();
        when(utilizationIntelligenceService.getUtilizationIntelligence(any(LocalDate.class), any(LocalDate.class))).thenReturn(response);
        mockMvc.perform(get("/costs/utilization").param("startDate", "2026-01-01").param("endDate", "2026-01-31"))
                .andExpect(status().isOk());
    }

    @Test
    void getLifecycle_returnsResponse() throws Exception {
        EquipmentLifecycleResponse response = new EquipmentLifecycleResponse();
        when(equipmentLifecycleService.getEquipmentLifecycle()).thenReturn(response);
        mockMvc.perform(get("/costs/lifecycle")).andExpect(status().isOk());
    }
}
