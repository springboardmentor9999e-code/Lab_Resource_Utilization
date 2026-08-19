package com.rems.service;

import com.rems.dto.LoginRequest;
import com.rems.dto.LoginResponse;
import com.rems.dto.RegisterRequest;
import com.rems.dto.RegisterResponse;
import com.rems.entity.Role;
import com.rems.entity.User;
import com.rems.enums.UserStatus;
import com.rems.exception.ApiException;
import com.rems.repository.*;
import com.rems.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private InstitutionRepository institutionRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private LabRepository labRepository;

    @Mock
    private BlacklistedTokenRepository blacklistedTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private NotificationService notificationService;

    @Mock
    private InAppNotificationService inAppNotificationService;

    @InjectMocks
    private AuthService authService;

    private Role studentRole;
    private Role adminRole;
    private User activeUser;

    @BeforeEach
    void setUp() {
        studentRole = Role.builder()
                .roleId(1)
                .roleName("Research/Student")
                .permissions(List.of("BOOK_EQUIPMENT", "VIEW_EQUIPMENT"))
                .build();

        adminRole = Role.builder()
                .roleId(5)
                .roleName("Institution Administrator")
                .permissions(List.of("MANAGE_INSTITUTION", "MANAGE_USERS"))
                .build();

        activeUser = User.builder()
                .userId(100L)
                .name("John Student")
                .email("john@example.com")
                .passwordHash("hashed_password")
                .status(UserStatus.ACTIVE)
                .roles(new HashSet<>())
                .build();
        activeUser.getRoles().add(studentRole);
    }

    @Test
    void register_Success_StudentUser() {
        RegisterRequest request = RegisterRequest.builder()
                .name("John Student")
                .email("john@example.com")
                .password("password123")
                .roleId(1)
                .build();

        when(roleRepository.findById(1)).thenReturn(Optional.of(studentRole));
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("hashed_password");

        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setUserId(100L);
            return u;
        });

        when(jwtUtil.generateToken(eq(100L), eq("john@example.com"), eq("Research/Student"), eq(1), anyList()))
                .thenReturn("mock-jwt-token");

        RegisterResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mock-jwt-token", response.getToken());
        assertNotNull(response.getUser());
        assertEquals("john@example.com", response.getUser().getEmail());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_ThrowsException_WhenInstitutionIdMissingForInstAdminRole() {
        RegisterRequest request = RegisterRequest.builder()
                .name("Admin User")
                .email("admin@example.com")
                .password("secret")
                .roleId(5)
                .institutionId(null) // Required for Role 5
                .build();

        when(roleRepository.findById(5)).thenReturn(Optional.of(adminRole));

        ApiException ex = assertThrows(ApiException.class, () -> authService.register(request));
        assertTrue(ex.getMessage().contains("Institution ID is required"));
    }

    @Test
    void login_Success_WithValidCredentials() {
        LoginRequest request = new LoginRequest("john@example.com", "password123", 1);

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("password123", "hashed_password")).thenReturn(true);
        when(jwtUtil.generateToken(eq(100L), eq("john@example.com"), eq("Research/Student"), eq(1), anyList()))
                .thenReturn("valid-jwt-token");

        LoginResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("valid-jwt-token", response.getToken());
        assertEquals("john@example.com", response.getUser().getEmail());
    }

    @Test
    void login_ThrowsException_WhenUserNotFound() {
        LoginRequest request = new LoginRequest("nonexistent@example.com", "password123", 1);

        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        ApiException ex = assertThrows(ApiException.class, () -> authService.login(request));
        assertTrue(ex.getMessage().contains("Invalid email or password"));
    }

    @Test
    void login_ThrowsException_WhenPasswordMismatch() {
        LoginRequest request = new LoginRequest("john@example.com", "wrongpassword", 1);

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("wrongpassword", "hashed_password")).thenReturn(false);

        ApiException ex = assertThrows(ApiException.class, () -> authService.login(request));
        assertTrue(ex.getMessage().contains("Invalid email or password"));
    }
}
