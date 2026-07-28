package com.lrplatform.controller;

import com.lrplatform.model.entity.Equipment;
import com.lrplatform.model.entity.User;
import com.lrplatform.model.enums.EquipmentStatus;
import com.lrplatform.model.enums.UserRole;
import com.lrplatform.security.*;
import com.lrplatform.service.EquipmentService;
import com.lrplatform.service.EquipmentAvailabilityService;
import com.lrplatform.service.UtilizationIntelligenceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EquipmentController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class EquipmentStatusTest {

    @Autowired MockMvc mockMvc;

    @MockBean EquipmentService equipmentService;
    @MockBean EquipmentAvailabilityService equipmentAvailabilityService;
    @MockBean UtilizationIntelligenceService utilizationIntelligenceService;
    @MockBean CurrentUserUtil currentUserUtil;
    @MockBean JwtTokenProvider jwtTokenProvider;
    @MockBean CustomUserDetailsService customUserDetailsService;
    @MockBean CustomOAuth2UserService customOAuth2UserService;
    @MockBean OAuth2AuthenticationSuccessHandler oauth2SuccessHandler;
    @MockBean CookieOAuth2AuthorizationRequestRepository cookieRepository;

    @Test
    void listEquipment_returnsPaginated() throws Exception {
        User systemAdmin = User.builder().id(1L).role(UserRole.SYSTEM_ADMIN).build();
        when(currentUserUtil.getCurrentUser(any())).thenReturn(systemAdmin);
        Equipment eq = Equipment.builder().id(1L).equipmentName("CNC Milling Machine").status(EquipmentStatus.AVAILABLE).build();
        when(equipmentService.getAllEquipment()).thenReturn(List.of(eq));

        mockMvc.perform(get("/equipment").param("page", "0").param("size", "10"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content").isArray()).andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void getEquipment_existingId_returnsEquipment() throws Exception {
        Equipment eq = Equipment.builder().id(1L).equipmentName("CNC Milling Machine").equipmentCode("CNC-001").status(EquipmentStatus.AVAILABLE).build();
        when(equipmentService.getEquipmentById(1L)).thenReturn(eq);
        mockMvc.perform(get("/equipment/1")).andExpect(status().isOk()).andExpect(jsonPath("$.equipmentName").value("CNC Milling Machine"));
    }

    @Test
    void searchEquipment_returnsList() throws Exception {
        when(equipmentService.searchEquipment(any(), any(), any(), any())).thenReturn(List.of());
        mockMvc.perform(get("/equipment/search").param("name", "CNC")).andExpect(status().isOk()).andExpect(jsonPath("$").isArray());
    }

    @Test
    void updateEquipmentStatus_returnsSuccess() throws Exception {
        mockMvc.perform(put("/equipment/1/status").param("status", "UNDER_MAINTENANCE"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.message").value("Equipment status updated"));
    }

    @Test
    void createEquipment_returnsSuccess() throws Exception {
        mockMvc.perform(post("/equipment")
                        .contentType("application/json")
                        .content("{\"equipmentCode\":\"TEST-001\",\"equipmentName\":\"Test Equipment\",\"categoryId\":1,\"laboratoryId\":1,\"manufacturer\":\"Test\",\"modelNumber\":\"TM-100\",\"serialNumber\":\"SN-TEST\",\"status\":\"AVAILABLE\",\"maxBookingHours\":8}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.message").value("Equipment created successfully"));
    }
}
