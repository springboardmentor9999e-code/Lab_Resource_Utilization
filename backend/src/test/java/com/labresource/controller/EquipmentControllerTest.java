package com.labresource.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.labresource.config.SecurityConfig;
import com.labresource.dto.request.EquipmentRequest;
import com.labresource.dto.response.EquipmentResponse;
import com.labresource.security.CustomUserDetailsService;
import com.labresource.security.JwtAuthenticationFilter;
import com.labresource.security.JwtService;
import com.labresource.service.interfaces.EquipmentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Web slice tests for the equipment API: role-based access enforcement
 * (mentor permission matrix) and endpoint wiring.
 */
@WebMvcTest(EquipmentController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class EquipmentControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockitoBean private EquipmentService equipmentService;
    @MockitoBean private JwtService jwtService;
    @MockitoBean private CustomUserDetailsService userDetailsService;

    private EquipmentResponse sampleResponse() {
        return EquipmentResponse.builder()
                .equipmentId(10L).equipmentName("Oscilloscope").equipmentCode("EQ-1")
                .category("Electronics").status("AVAILABLE").build();
    }

    private String validBody() throws Exception {
        EquipmentRequest request = new EquipmentRequest();
        request.setEquipmentName("Oscilloscope");
        request.setEquipmentCode("EQ-1");
        request.setCategory("Electronics");
        return objectMapper.writeValueAsString(request);
    }

    // -------------------- view (all authenticated) --------------------

    @Test
    @WithMockUser(username = "student", roles = "STUDENT")
    void list_allowsAnyAuthenticatedUser() throws Exception {
        when(equipmentService.searchEquipment(any(), any(), any(), any(), any(), any(), any(), anyInt(), anyInt()))
                .thenReturn(new PageImpl<>(List.of(sampleResponse())));

        mockMvc.perform(get("/api/equipment"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].equipmentCode").value("EQ-1"));
    }

    @Test
    void list_rejectsAnonymousUser() throws Exception {
        mockMvc.perform(get("/api/equipment"))
                .andExpect(status().isForbidden());
    }

    // -------------------- create (privileged roles only) --------------------

    @Test
    @WithMockUser(username = "mgr", roles = "LAB_MANAGER")
    void create_allowedForLabManager() throws Exception {
        when(equipmentService.createEquipment(any(EquipmentRequest.class))).thenReturn(sampleResponse());

        mockMvc.perform(post("/api/equipment").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validBody()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.equipmentName").value("Oscilloscope"));
    }

    @Test
    @WithMockUser(username = "student", roles = "STUDENT")
    void create_forbiddenForStudent() throws Exception {
        mockMvc.perform(post("/api/equipment").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validBody()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin", roles = "SYSTEM_ADMIN")
    void create_missingRequiredFieldsRejected() throws Exception {
        mockMvc.perform(post("/api/equipment").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"));
    }

    // -------------------- delete (no LAB_TECHNICIAN) --------------------

    @Test
    @WithMockUser(username = "head", roles = "DEPARTMENT_HEAD")
    void delete_allowedForDepartmentHead() throws Exception {
        mockMvc.perform(delete("/api/equipment/10").with(csrf()))
                .andExpect(status().isNoContent());

        verify(equipmentService).deleteEquipment(10L);
    }

    @Test
    @WithMockUser(username = "tech", roles = "LAB_TECHNICIAN")
    void delete_forbiddenForLabTechnician() throws Exception {
        mockMvc.perform(delete("/api/equipment/10").with(csrf()))
                .andExpect(status().isForbidden());
    }
}
