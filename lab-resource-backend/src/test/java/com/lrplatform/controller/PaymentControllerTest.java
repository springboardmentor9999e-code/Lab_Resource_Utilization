package com.lrplatform.controller;

import com.lrplatform.dto.response.PaymentResponse;
import com.lrplatform.dto.response.PaginatedResponse;
import com.lrplatform.model.entity.User;
import com.lrplatform.model.enums.UserRole;
import com.lrplatform.security.*;
import com.lrplatform.service.PaymentService;
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
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PaymentController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
class PaymentControllerTest {

    @Autowired MockMvc mockMvc;

    @MockBean PaymentService paymentService;
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
    void listPayments_returnsPaginated() throws Exception {
        PaginatedResponse<PaymentResponse> response = PaginatedResponse.<PaymentResponse>builder()
                .content(List.of()).totalElements(0L).build();
        when(paymentService.getAllPayments(anyInt(), anyInt(), any(), any())).thenReturn(response);
        mockMvc.perform(get("/payments").param("page", "0").param("size", "10"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void createPayment_validRequest_returnsCreated() throws Exception {
        PaymentResponse response = PaymentResponse.builder().id(1L).amountPaid(new BigDecimal("2000.00")).build();
        when(paymentService.recordPayment(any())).thenReturn(response);
        mockMvc.perform(post("/payments")
                        .contentType("application/json")
                        .content("{\"invoiceId\":1,\"amountPaid\":2000,\"paymentMethod\":\"BANK_TRANSFER\"}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void getPaymentSummary_returnsResponse() throws Exception {
        when(paymentService.getPaymentSummary()).thenReturn(Map.of("total", 50000));
        mockMvc.perform(get("/payments/summary")).andExpect(status().isOk()).andExpect(jsonPath("$.total").value(50000));
    }
}
