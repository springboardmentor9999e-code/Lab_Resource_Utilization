package com.lrplatform.controller;

import com.lrplatform.dto.response.AnnouncementResponse;
import com.lrplatform.model.entity.User;
import com.lrplatform.model.enums.UserRole;
import com.lrplatform.security.*;
import com.lrplatform.service.AnnouncementService;
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

@WebMvcTest(AnnouncementController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class AnnouncementControllerTest {

    @Autowired MockMvc mockMvc;

    @MockBean AnnouncementService announcementService;
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
        when(currentUserUtil.getCurrentUserId(any(HttpServletRequest.class))).thenReturn(1L);
    }

    @Test
    void listAnnouncements_returnsList() throws Exception {
        when(announcementService.getAllAnnouncements()).thenReturn(List.of());
        mockMvc.perform(get("/announcements")).andExpect(status().isOk()).andExpect(jsonPath("$").isArray());
    }

    @Test
    void getActiveAnnouncements_returnsList() throws Exception {
        when(announcementService.getActiveAnnouncements(any(), any())).thenReturn(List.of());
        mockMvc.perform(get("/announcements/active")).andExpect(status().isOk()).andExpect(jsonPath("$").isArray());
    }

    @Test
    void createAnnouncement_validRequest_returnsCreated() throws Exception {
        AnnouncementResponse response = new AnnouncementResponse();
        response.setId(1L);
        response.setTitle("Test Announcement");
        when(announcementService.createAnnouncement(any(), anyLong())).thenReturn(response);

        mockMvc.perform(post("/announcements")
                        .contentType("application/json")
                        .content("{\"title\":\"Test Announcement\",\"content\":\"Content\",\"institutionId\":1}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Test Announcement"));
    }

    @Test
    void updateAnnouncement_validRequest_returnsUpdated() throws Exception {
        AnnouncementResponse response = new AnnouncementResponse();
        response.setId(1L);
        response.setTitle("Updated Title");
        when(announcementService.updateAnnouncement(eq(1L), any(), anyLong())).thenReturn(response);

        mockMvc.perform(put("/announcements/1")
                        .contentType("application/json")
                        .content("{\"title\":\"Updated Title\",\"content\":\"Updated\",\"institutionId\":1}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Title"));
    }

    @Test
    void publishAnnouncement_returnsUpdated() throws Exception {
        AnnouncementResponse response = new AnnouncementResponse();
        response.setId(1L);
        response.setPublished(true);
        when(announcementService.publishAnnouncement(1L)).thenReturn(response);

        mockMvc.perform(put("/announcements/1/publish"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.published").value(true));
    }

    @Test
    void deleteAnnouncement_returnsSuccess() throws Exception {
        mockMvc.perform(delete("/announcements/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Announcement deleted successfully"));
    }
}
