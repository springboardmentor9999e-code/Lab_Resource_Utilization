package com.lrplatform.controller;

import com.lrplatform.dto.response.UserListResponse;
import com.lrplatform.dto.response.UserResponse;
import com.lrplatform.model.entity.Institution;
import com.lrplatform.model.entity.User;
import com.lrplatform.model.enums.UserRole;
import com.lrplatform.security.*;
import com.lrplatform.service.UserManagementService;
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

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserManagementController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class UserManagementControllerTest {

    @Autowired MockMvc mockMvc;

    @MockBean UserManagementService userManagementService;
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
                .firstName("Admin")
                .lastName("User")
                .email("admin@test.com")
                .role(UserRole.SYSTEM_ADMIN)
                .build();
        when(currentUserUtil.getCurrentUser(any(HttpServletRequest.class))).thenReturn(sysAdmin);
    }

    @Test
    void listUsers_returnsPaginatedUsers() throws Exception {
        UserListResponse response = UserListResponse.builder()
                .users(List.of()).totalElements(5L).totalPages(1).currentPage(0).pageSize(10).build();
        when(userManagementService.getAllUsers(anyInt(), anyInt(), any(), any(), any(), any())).thenReturn(response);

        mockMvc.perform(get("/admin/users").param("page", "0").param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(5));
    }

    @Test
    void getUser_existingId_returnsUser() throws Exception {
        UserResponse userResponse = new UserResponse();
        userResponse.setId(4L);
        userResponse.setEmail("arun@demouniversity.edu");
        userResponse.setRole(UserRole.RESEARCHER);
        when(userManagementService.getUserById(4L)).thenReturn(userResponse);

        mockMvc.perform(get("/admin/users/4"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("arun@demouniversity.edu"));
    }

    @Test
    void createUser_validRequest_returnsCreated() throws Exception {
        mockMvc.perform(post("/admin/users")
                        .contentType("application/json")
                        .content("{\"firstName\":\"New\",\"lastName\":\"User\",\"email\":\"new@test.com\",\"password\":\"Test@123456\",\"role\":\"RESEARCHER\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("User created successfully"));
    }

    @Test
    void updateUser_validRequest_returnsUpdated() throws Exception {
        UserResponse userResponse = new UserResponse();
        userResponse.setId(4L);
        userResponse.setFirstName("Updated");
        when(userManagementService.updateUser(eq(4L), any())).thenReturn(userResponse);

        mockMvc.perform(put("/admin/users/4")
                        .contentType("application/json")
                        .content("{\"firstName\":\"Updated\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Updated"));
    }

    @Test
    void changeRole_validRequest_returnsUpdated() throws Exception {
        UserResponse userResponse = new UserResponse();
        userResponse.setId(4L);
        userResponse.setRole(UserRole.LAB_TECHNICIAN);
        when(userManagementService.changeUserRole(eq(4L), any())).thenReturn(userResponse);

        mockMvc.perform(put("/admin/users/4/role")
                        .contentType("application/json")
                        .content("{\"role\":\"LAB_TECHNICIAN\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("LAB_TECHNICIAN"));
    }

    @Test
    void toggleStatus_existingUser_returnsToggled() throws Exception {
        UserResponse userResponse = new UserResponse();
        userResponse.setId(5L);
        userResponse.setStatus(false);
        when(userManagementService.toggleUserStatus(5L)).thenReturn(userResponse);

        mockMvc.perform(put("/admin/users/5/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(false));
    }

    @Test
    void resetPassword_adminRequest_returnsSuccess() throws Exception {
        mockMvc.perform(post("/admin/users/4/reset-password")
                        .contentType("application/json")
                        .content("{\"newPassword\":\"ResetPass@123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password reset successfully"));
    }

    @Test
    void deleteUser_existingUser_returnsSuccess() throws Exception {
        mockMvc.perform(delete("/admin/users/4"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("User deleted successfully"));
    }
}
