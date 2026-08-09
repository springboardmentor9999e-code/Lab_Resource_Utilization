package com.labresource.platform.service;

import com.labresource.platform.dto.AuthenticationResponse;
import com.labresource.platform.dto.LoginRequest;
import com.labresource.platform.dto.RegisterRequest;
import com.labresource.platform.dto.UserResponse;
import com.labresource.platform.entity.Role;
import com.labresource.platform.entity.User;
import com.labresource.platform.exception.DuplicateEmailException;
import com.labresource.platform.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    public AuthenticationService(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            PasswordEncoder passwordEncoder,
            UserRepository userRepository
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
    }

    @Transactional
    public AuthenticationResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());

        if (userRepository.existsByEmail(email)) {
            throw new DuplicateEmailException("A user with this email already exists");
        }

        User user = User.builder()
                .firstName(request.firstName().trim())
                .lastName(request.lastName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.password()))
                .role(Role.ROLE_STUDENT)
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser);

        return AuthenticationResponse.bearer(
                token,
                jwtService.expirationMs(),
                UserResponse.from(savedUser)
        );
    }

    @Transactional(readOnly = true)
    public AuthenticationResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.password())
        );

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated user was not found"));
        String token = jwtService.generateToken(user);

        return AuthenticationResponse.bearer(token, jwtService.expirationMs(), UserResponse.from(user));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}
