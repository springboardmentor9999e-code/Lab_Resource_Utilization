package com.lrplatform.controller;

import com.lrplatform.dto.response.*;
import com.lrplatform.model.entity.User;
import com.lrplatform.model.enums.UserRole;
import com.lrplatform.security.*;
import com.lrplatform.service.ResourceSharingService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ResourceSharingController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class ResourceSharingControllerTest {

    @Autowired MockMvc mockMvc;

    @MockBean ResourceSharingService resourceSharingService;
    @MockBean CurrentUserUtil currentUserUtil;
    @MockBean JwtTokenProvider jwtTokenProvider;
    @MockBean CustomUserDetailsService customUserDetailsService;
    @MockBean CustomOAuth2UserService customOAuth2UserService;
    @MockBean OAuth2AuthenticationSuccessHandler oauth2SuccessHandler;
    @MockBean CookieOAuth2AuthorizationRequestRepository cookieRepository;

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
    void listSharedEquipment_returnsList() throws Exception {
        when(resourceSharingService.getAllSharedEquipment()).thenReturn(List.of());
        mockMvc.perform(get("/sharing/equipment")).andExpect(status().isOk()).andExpect(jsonPath("$").isArray());
    }

    @Test
    void shareEquipment_validRequest_returnsCreated() throws Exception {
        SharedEquipmentResponse response = new SharedEquipmentResponse();
        response.setId(1L);
        when(resourceSharingService.shareEquipment(any())).thenReturn(response);
        mockMvc.perform(post("/sharing/equipment")
                        .contentType("application/json")
                        .content("{\"equipmentId\":1,\"hourlyRate\":500,\"dailyRate\":3000}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void listPartnerships_returnsList() throws Exception {
        when(resourceSharingService.getAllPartnerships()).thenReturn(List.of());
        mockMvc.perform(get("/sharing/partnerships")).andExpect(status().isOk()).andExpect(jsonPath("$").isArray());
    }

    @Test
    void createPartnership_validRequest_returnsCreated() throws Exception {
        PartnershipResponse response = new PartnershipResponse();
        response.setId(1L);
        when(resourceSharingService.createPartnership(any())).thenReturn(response);
        mockMvc.perform(post("/sharing/partnerships")
                        .contentType("application/json")
                        .content("{\"institutionAId\":1,\"institutionBId\":1}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void getSharingAnalytics_returnsResponse() throws Exception {
        SharingAnalyticsResponse response = new SharingAnalyticsResponse();
        when(resourceSharingService.getSharingAnalytics()).thenReturn(response);
        mockMvc.perform(get("/sharing/analytics")).andExpect(status().isOk());
    }
}
