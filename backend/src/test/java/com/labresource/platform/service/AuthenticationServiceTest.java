package com.labresource.platform.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.labresource.platform.dto.AuthenticationResponse;
import com.labresource.platform.dto.LoginRequest;
import com.labresource.platform.dto.RegisterRequest;
import com.labresource.platform.entity.Role;
import com.labresource.platform.entity.User;
import com.labresource.platform.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserRepository userRepository;

    @Captor
    private ArgumentCaptor<User> userCaptor;

    @Captor
    private ArgumentCaptor<UsernamePasswordAuthenticationToken> authenticationCaptor;

    @InjectMocks
    private AuthenticationService authenticationService;

    @Test
    void registerAssignsDefaultStudentRole() {
        RegisterRequest request = new RegisterRequest(
                "Vedant",
                "Patil",
                "Vedant@Example.com",
                "Password@123"
        );

        when(userRepository.existsByEmail("vedant@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Password@123")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtService.generateToken(any(User.class))).thenReturn("jwt-token");
        when(jwtService.expirationMs()).thenReturn(86_400_000L);

        AuthenticationResponse response = authenticationService.register(request);

        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();

        assertThat(savedUser.getRole()).isEqualTo(Role.ROLE_STUDENT);
        assertThat(savedUser.getEmail()).isEqualTo("vedant@example.com");
        assertThat(savedUser.getPassword()).isEqualTo("encoded-password");
        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.user().role()).isEqualTo(Role.ROLE_STUDENT);
    }

    @Test
    void loginAuthenticatesAndReturnsJwtResponse() {
        LoginRequest request = new LoginRequest("Vedant@Example.com", "Password@123");
        User user = User.builder()
                .id(1L)
                .firstName("Vedant")
                .lastName("Patil")
                .email("vedant@example.com")
                .password("encoded-password")
                .role(Role.ROLE_STUDENT)
                .enabled(true)
                .build();

        when(userRepository.findByEmail("vedant@example.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("jwt-token");
        when(jwtService.expirationMs()).thenReturn(86_400_000L);

        AuthenticationResponse response = authenticationService.login(request);

        verify(authenticationManager).authenticate(authenticationCaptor.capture());
        UsernamePasswordAuthenticationToken authentication = authenticationCaptor.getValue();

        assertThat(authentication.getName()).isEqualTo("vedant@example.com");
        assertThat(authentication.getCredentials()).isEqualTo("Password@123");
        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.tokenType()).isEqualTo("Bearer");
        assertThat(response.user().email()).isEqualTo("vedant@example.com");
    }
}
