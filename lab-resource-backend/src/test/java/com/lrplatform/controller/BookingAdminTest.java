package com.lrplatform.controller;

import com.lrplatform.model.entity.User;
import com.lrplatform.model.enums.UserRole;
import com.lrplatform.security.*;
import com.lrplatform.service.BookingService;
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

@WebMvcTest(BookingController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class BookingAdminTest {

    @Autowired MockMvc mockMvc;

    @MockBean BookingService bookingService;
    @MockBean CurrentUserUtil currentUserUtil;
    @MockBean JwtTokenProvider jwtTokenProvider;
    @MockBean CustomUserDetailsService customUserDetailsService;
    @MockBean CustomOAuth2UserService customOAuth2UserService;
    @MockBean OAuth2AuthenticationSuccessHandler oauth2SuccessHandler;
    @MockBean CookieOAuth2AuthorizationRequestRepository cookieRepository;

    @Test
    void listBookings_returnsPaginated() throws Exception {
        User systemAdmin = User.builder().id(1L).role(UserRole.SYSTEM_ADMIN).build();
        when(currentUserUtil.getCurrentUser(any())).thenReturn(systemAdmin);
        when(bookingService.getFilteredBookings(any())).thenReturn(List.of());

        mockMvc.perform(get("/bookings").param("page", "0").param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    void getPendingBookings_returnsList() throws Exception {
        User systemAdmin = User.builder().id(1L).role(UserRole.SYSTEM_ADMIN).build();
        when(currentUserUtil.getCurrentUser(any())).thenReturn(systemAdmin);
        when(bookingService.getPendingApprovals()).thenReturn(List.of());

        mockMvc.perform(get("/bookings/pending"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void approveBooking_validRequest_returnsSuccess() throws Exception {
        when(currentUserUtil.getCurrentUserId(any())).thenReturn(1L);
        mockMvc.perform(put("/bookings/1/approve")
                        .contentType("application/json")
                        .content("{\"remarks\":\"Approved\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Booking approved"));
    }

    @Test
    void rejectBooking_validRequest_returnsSuccess() throws Exception {
        when(currentUserUtil.getCurrentUserId(any())).thenReturn(1L);
        mockMvc.perform(put("/bookings/1/reject")
                        .contentType("application/json")
                        .content("{\"remarks\":\"Rejected\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Booking rejected"));
    }

    @Test
    void getMyBookings_returnsList() throws Exception {
        when(currentUserUtil.getCurrentUserId(any())).thenReturn(1L);
        when(bookingService.getMyBookings(1L)).thenReturn(List.of());

        mockMvc.perform(get("/bookings/my"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
