package com.lrplatform.controller;

import com.lrplatform.dto.response.RoleResponse;
import com.lrplatform.dto.response.UserListResponse;
import com.lrplatform.security.*;
import com.lrplatform.service.RoleManagementService;
import com.lrplatform.service.UserManagementService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RoleManagementController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class RoleManagementControllerTest {

    @Autowired MockMvc mockMvc;

    @MockBean UserManagementService userManagementService;
    @MockBean RoleManagementService roleManagementService;
    @MockBean JwtTokenProvider jwtTokenProvider;
    @MockBean CustomUserDetailsService customUserDetailsService;
    @MockBean CustomOAuth2UserService customOAuth2UserService;
    @MockBean OAuth2AuthenticationSuccessHandler oauth2SuccessHandler;
    @MockBean CookieOAuth2AuthorizationRequestRepository cookieRepository;

    @Test
    void listRoles_returnsRoles() throws Exception {
        RoleResponse roleResponse = RoleResponse.builder().roleName("RESEARCHER").description("Research personnel").enabled(true).build();
        when(roleManagementService.getAllRoles()).thenReturn(List.of(roleResponse));

        mockMvc.perform(get("/admin/roles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].roleName").value("RESEARCHER"));
    }

    @Test
    void getRoleConfig_validRole_returnsConfig() throws Exception {
        RoleResponse roleResponse = RoleResponse.builder().roleName("RESEARCHER").description("Research personnel").enabled(true).build();
        when(roleManagementService.getRoleConfig("RESEARCHER")).thenReturn(roleResponse);

        mockMvc.perform(get("/admin/roles/RESEARCHER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roleName").value("RESEARCHER"));
    }

    @Test
    void getRoleUsers_validRole_returnsUsers() throws Exception {
        UserListResponse userListResponse = UserListResponse.builder().users(List.of()).totalElements(0L).build();
        when(userManagementService.getAllUsers(0, 100, null, "RESEARCHER", null, null)).thenReturn(userListResponse);

        mockMvc.perform(get("/admin/roles/RESEARCHER/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void updateRoleConfig_validRequest_returnsSuccess() throws Exception {
        when(roleManagementService.updateRoleConfig(eq("RESEARCHER"), any())).thenReturn(null);

        mockMvc.perform(put("/admin/roles/RESEARCHER")
                        .contentType("application/json")
                        .content("{\"description\":\"Updated description\",\"enabled\":true}"))
                .andExpect(status().isOk());
    }
}
