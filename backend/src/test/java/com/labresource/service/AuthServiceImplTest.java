package com.labresource.service;

import com.labresource.dto.request.ForgotPasswordRequest;
import com.labresource.dto.request.LoginRequest;
import com.labresource.dto.request.RegisterRequest;
import com.labresource.dto.request.VerifyOtpRequest;
import com.labresource.dto.response.ApiResponse;
import com.labresource.dto.response.AuthResponse;
import com.labresource.entity.*;
import com.labresource.repository.*;
import com.labresource.security.CustomUserDetailsService;
import com.labresource.security.JwtService;
import com.labresource.service.impl.AuthServiceImpl;
import com.labresource.service.impl.EmailService;
import com.labresource.service.impl.GoogleTokenVerifierService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for registration validation, login token issuance and the
 * OTP-based password reset flow. Pure Mockito — no Spring context required.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock private AppUserRepository appUserRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private InstitutionRepository institutionRepository;
    @Mock private DepartmentRepository departmentRepository;
    @Mock private UserRoleRepository userRoleRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtService jwtService;
    @Mock private CustomUserDetailsService userDetailsService;
    @Mock private EmailService emailService;
    @Mock private GoogleTokenVerifierService googleTokenVerifierService;

    @InjectMocks private AuthServiceImpl authService;

    private Institution institution;
    private Department department;
    private AppUser user;

    @BeforeEach
    void setUp() {
        institution = Institution.builder().institutionId(1L).name("Test University").code("TU").build();
        department = Department.builder().departmentId(2L).name("Physics").code("PHY")
                .institution(institution).build();
        user = AppUser.builder()
                .userId(1L).username("student").email("sam@test.local")
                .password("$hashed").firstName("Sam").lastName("Student")
                .institution(institution).department(department)
                .isActive(true).userRoles(new HashSet<>()).build();
    }

    private RegisterRequest registerRequest() {
        RegisterRequest r = new RegisterRequest();
        r.setUsername("newuser");
        r.setEmail("new@test.local");
        r.setPassword("secret123");
        r.setFirstName("New");
        r.setLastName("User");
        return r;
    }

    // -------------------- registerUser --------------------

    @Test
    void register_rejectsDuplicateUsername() {
        when(appUserRepository.existsByUsername("newuser")).thenReturn(true);

        ApiResponse<?> resp = authService.registerUser(registerRequest());

        assertFalse(resp.isSuccess());
        assertTrue(resp.getMessage().contains("Username already exists"));
        verify(appUserRepository, never()).save(any());
    }

    @Test
    void register_rejectsDuplicateEmail() {
        when(appUserRepository.existsByUsername("newuser")).thenReturn(false);
        when(appUserRepository.existsByEmail("new@test.local")).thenReturn(true);

        ApiResponse<?> resp = authService.registerUser(registerRequest());

        assertFalse(resp.isSuccess());
        assertTrue(resp.getMessage().contains("Email already exists"));
    }

    @Test
    void register_hashesPasswordAndDefaultsToStudentRole() {
        when(appUserRepository.existsByUsername("newuser")).thenReturn(false);
        when(appUserRepository.existsByEmail("new@test.local")).thenReturn(false);
        when(institutionRepository.findAll()).thenReturn(List.of(institution));
        when(departmentRepository.findAll()).thenReturn(List.of(department));
        when(passwordEncoder.encode("secret123")).thenReturn("$hashed");
        when(appUserRepository.save(any(AppUser.class))).thenAnswer(inv -> {
            AppUser u = inv.getArgument(0);
            u.setUserId(42L);
            return u;
        });
        when(roleRepository.findByRoleName("STUDENT"))
                .thenReturn(Optional.of(Role.builder().roleId(7L).roleName("STUDENT").build()));

        ApiResponse<?> resp = authService.registerUser(registerRequest());

        assertTrue(resp.isSuccess());
        verify(passwordEncoder).encode("secret123"); // never stored in plain text
        verify(appUserRepository).save(argThat(u -> "$hashed".equals(u.getPassword())));
        verify(userRoleRepository).save(argThat(ur -> "STUDENT".equals(ur.getRole().getRoleName())));
    }

    // -------------------- loginUser --------------------

    @Test
    void login_issuesAccessAndRefreshTokens() {
        UserDetails principal = User.withUsername("student").password("$hashed")
                .authorities(new SimpleGrantedAuthority("ROLE_STUDENT")).build();
        Authentication auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        when(authenticationManager.authenticate(any())).thenReturn(auth);
        when(appUserRepository.findByUsername("student")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(principal)).thenReturn("jwt-token");

        LoginRequest req = new LoginRequest();
        req.setUsername("student");
        req.setPassword("secret123");

        AuthResponse resp = authService.loginUser(req);

        assertEquals("jwt-token", resp.getAccessToken());
        assertNotNull(resp.getRefreshToken());
        assertEquals("student", resp.getUsername());
        verify(refreshTokenRepository).save(argThat(t -> !Boolean.TRUE.equals(t.getRevoked())));
        assertNotNull(user.getLastLoginAt()); // login timestamp recorded
    }

    @Test
    void login_propagatesBadCredentials() {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        LoginRequest req = new LoginRequest();
        req.setUsername("student");
        req.setPassword("wrong");

        assertThrows(BadCredentialsException.class, () -> authService.loginUser(req));
        verify(refreshTokenRepository, never()).save(any());
    }

    // -------------------- forgotPassword / verifyOtp --------------------

    @Test
    void forgotPassword_createsOtpTokenAndSendsEmail() {
        when(appUserRepository.findByEmail("sam@test.local")).thenReturn(Optional.of(user));

        ForgotPasswordRequest req = new ForgotPasswordRequest();
        req.setEmail("sam@test.local");

        ApiResponse<?> resp = authService.forgotPassword(req);

        assertTrue(resp.isSuccess());
        verify(passwordResetTokenRepository).save(argThat(t ->
                t.getOtp().matches("\\d{6}") && !Boolean.TRUE.equals(t.getOtpVerified())));
        verify(emailService).sendOtpEmail(eq("sam@test.local"), eq("Sam"), matches("\\d{6}"));
    }

    @Test
    void forgotPassword_rejectsUnknownEmail() {
        when(appUserRepository.findByEmail("ghost@test.local")).thenReturn(Optional.empty());

        ForgotPasswordRequest req = new ForgotPasswordRequest();
        req.setEmail("ghost@test.local");

        assertThrows(RuntimeException.class, () -> authService.forgotPassword(req));
    }

    private PasswordResetToken resetToken(String otp) {
        return PasswordResetToken.builder()
                .user(user).token("session-token").otp(otp)
                .otpVerified(false).attempts(0).used(false)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .createdAt(LocalDateTime.now()).build();
    }

    @Test
    void verifyOtp_correctOtpReturnsSessionToken() {
        when(appUserRepository.findByEmail("sam@test.local")).thenReturn(Optional.of(user));
        when(passwordResetTokenRepository.findTopByUser_UserIdOrderByCreatedAtDesc(1L))
                .thenReturn(Optional.of(resetToken("123456")));

        VerifyOtpRequest req = new VerifyOtpRequest();
        req.setEmail("sam@test.local");
        req.setOtp("123456");

        ApiResponse<?> resp = authService.verifyOtp(req);

        assertTrue(resp.isSuccess());
        assertEquals("session-token", resp.getData());
    }

    @Test
    void verifyOtp_wrongOtpCountsAttempt() {
        PasswordResetToken token = resetToken("123456");
        when(appUserRepository.findByEmail("sam@test.local")).thenReturn(Optional.of(user));
        when(passwordResetTokenRepository.findTopByUser_UserIdOrderByCreatedAtDesc(1L))
                .thenReturn(Optional.of(token));

        VerifyOtpRequest req = new VerifyOtpRequest();
        req.setEmail("sam@test.local");
        req.setOtp("000000");

        assertThrows(RuntimeException.class, () -> authService.verifyOtp(req));
        assertEquals(1, token.getAttempts());
    }

    @Test
    void verifyOtp_rejectsExpiredToken() {
        PasswordResetToken token = resetToken("123456");
        token.setExpiresAt(LocalDateTime.now().minusMinutes(1));
        when(appUserRepository.findByEmail("sam@test.local")).thenReturn(Optional.of(user));
        when(passwordResetTokenRepository.findTopByUser_UserIdOrderByCreatedAtDesc(1L))
                .thenReturn(Optional.of(token));

        VerifyOtpRequest req = new VerifyOtpRequest();
        req.setEmail("sam@test.local");
        req.setOtp("123456");

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.verifyOtp(req));
        assertTrue(ex.getMessage().contains("expired"));
    }
}
