package com.lrplatform.controller;

import com.lrplatform.dto.response.InvoiceResponse;
import com.lrplatform.dto.response.PaginatedResponse;
import com.lrplatform.model.entity.User;
import com.lrplatform.model.enums.UserRole;
import com.lrplatform.security.*;
import com.lrplatform.service.InvoiceService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(InvoiceController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class InvoiceControllerTest {

    @Autowired MockMvc mockMvc;

    @MockBean InvoiceService invoiceService;
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
    void listInvoices_returnsPaginated() throws Exception {
        PaginatedResponse<InvoiceResponse> response = PaginatedResponse.<InvoiceResponse>builder()
                .content(List.of()).totalElements(0L).build();
        when(invoiceService.getAllInvoices(anyInt(), anyInt(), any(), any())).thenReturn(response);
        mockMvc.perform(get("/invoices").param("page", "0").param("size", "10"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void createInvoice_validRequest_returnsCreated() throws Exception {
        InvoiceResponse response = InvoiceResponse.builder().id(1L).totalAmount(new BigDecimal("1500.00")).build();
        when(invoiceService.createInvoice(any())).thenReturn(response);
        mockMvc.perform(post("/invoices")
                        .contentType("application/json")
                        .content("{\"institutionId\":1,\"totalAmount\":1500,\"dueDate\":\"2026-08-24\"}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void listOverdueInvoices_returnsList() throws Exception {
        PaginatedResponse<InvoiceResponse> response = PaginatedResponse.<InvoiceResponse>builder()
                .content(List.of()).totalElements(0L).build();
        when(invoiceService.getOverdueInvoices(anyInt(), anyInt())).thenReturn(response);
        mockMvc.perform(get("/invoices/overdue")).andExpect(status().isOk()).andExpect(jsonPath("$.content").isArray());
    }
}
