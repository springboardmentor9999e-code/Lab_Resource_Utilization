package com.labresource.service.impl;

import com.labresource.dto.request.ForgotPasswordRequest;
import com.labresource.dto.request.GoogleAuthRequest;
import com.labresource.dto.request.LoginRequest;
import com.labresource.dto.request.RefreshTokenRequest;
import com.labresource.dto.request.RegisterRequest;
import com.labresource.dto.request.ResetPasswordRequest;
import com.labresource.dto.request.VerifyOtpRequest;
import com.labresource.dto.response.ApiResponse;
import com.labresource.dto.response.AuthResponse;
import com.labresource.dto.response.UserResponse;
import com.labresource.entity.*;
import com.labresource.repository.*;
import com.labresource.security.JwtService;
import com.labresource.security.CustomUserDetailsService;
import com.labresource.service.interfaces.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    
    private final AppUserRepository appUserRepository;
    private final RoleRepository roleRepository;
    private final InstitutionRepository institutionRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRoleRepository userRoleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final EmailService emailService;
    private final GoogleTokenVerifierService googleTokenVerifierService;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int MAX_OTP_ATTEMPTS = 5;
    private static final Set<String> OAUTH_ALLOWED_ROLES = Set.of(
            "STUDENT", "RESEARCHER", "LAB_TECHNICIAN", "LAB_MANAGER", "DEPARTMENT_HEAD");
    
    @Override
    @Transactional
    public ApiResponse<?> registerUser(RegisterRequest request) {
        if (appUserRepository.existsByUsername(request.getUsername())) {
            return new ApiResponse<>(false, "Username already exists", null);
        }
        
        if (appUserRepository.existsByEmail(request.getEmail())) {
            return new ApiResponse<>(false, "Email already exists", null);
        }
        
        Institution institution = null;
        if (request.getInstitutionId() != null) {
            institution = institutionRepository.findById(request.getInstitutionId()).orElse(null);
            if (institution == null) {
                return new ApiResponse<>(false, "Institution not found", null);
            }
        } else {
            institution = institutionRepository.findAll().stream().findFirst().orElse(null);
            if (institution == null) {
                return new ApiResponse<>(false, "No default institution exists in the system", null);
            }
        }
        
        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId()).orElse(null);
            if (department == null) {
                return new ApiResponse<>(false, "Department not found", null);
            }
        } else {
            department = departmentRepository.findAll().stream().findFirst().orElse(null);
            if (department == null) {
                return new ApiResponse<>(false, "No default department exists in the system", null);
            }
        }
        
        AppUser user = AppUser.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .institution(institution)
                .department(department)
                .isActive(true)
                .isVerified(true)
                .status(UserStatus.ACTIVE)
                .userRoles(new HashSet<>())
                .build();
        
        AppUser savedUser = appUserRepository.save(user);
        
        Set<String> savedRoles = new HashSet<>();
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            for (String roleName : request.getRoles()) {
                Role role = roleRepository.findByRoleName(roleName.toUpperCase())
                        .orElseGet(() -> roleRepository.save(Role.builder()
                                .roleName(roleName.toUpperCase())
                                .description(roleName + " role")
                                .isSystemRole(false)
                                .build()));
                
                UserRoleId userRoleId = new UserRoleId(savedUser.getUserId(), role.getRoleId());
                UserRole userRole = UserRole.builder()
                        .id(userRoleId)
                        .user(savedUser)
                        .role(role)
                        .createdAt(LocalDateTime.now())
                        .build();
                
                userRoleRepository.save(userRole);
                savedRoles.add(role.getRoleName());
            }
        } else {
            Role role = roleRepository.findByRoleName("STUDENT")
                    .orElseGet(() -> roleRepository.save(Role.builder()
                            .roleName("STUDENT")
                            .description("Student role")
                            .isSystemRole(false)
                            .build()));
            
            UserRoleId userRoleId = new UserRoleId(savedUser.getUserId(), role.getRoleId());
            UserRole userRole = UserRole.builder()
                    .id(userRoleId)
                    .user(savedUser)
                    .role(role)
                    .createdAt(LocalDateTime.now())
                    .build();
            
            userRoleRepository.save(userRole);
            savedRoles.add(role.getRoleName());
        }
        
        UserResponse userResponse = UserResponse.builder()
                .userId(savedUser.getUserId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .phone(savedUser.getPhone())
                .institution(institution.getName())
                .department(department.getName())
                .roles(savedRoles)
                .active(savedUser.getIsActive())
                .build();
        
        return new ApiResponse<>(true, "User registered successfully", userResponse);
    }
    
    @Override
    @Transactional
    public AuthResponse loginUser(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );
        
        AppUser user = appUserRepository.findByUsername(request.getUsername())
                .or(() -> appUserRepository.findByEmail(request.getUsername()))
                .orElseThrow(() -> new RuntimeException("User not found after authentication"));
        
        user.setLastLoginAt(LocalDateTime.now());
        appUserRepository.save(user);
        
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String accessToken = jwtService.generateToken(userDetails);
        
        String refreshTokenString = UUID.randomUUID().toString();
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(refreshTokenString)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .revoked(false)
                .createdAt(LocalDateTime.now())
                .build();
        
        refreshTokenRepository.save(refreshToken);
        
        Set<String> roles = user.getUserRoles().stream()
                .map(r -> r.getRole().getRoleName())
                .collect(Collectors.toSet());
        
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenString)
                .username(user.getUsername())
                .roles(roles)
                .build();
    }
    
    @Override
    @Transactional
    public AuthResponse googleAuth(GoogleAuthRequest request) {
        Map<String, Object> claims = googleTokenVerifierService.verify(request.getIdToken());

        String email = String.valueOf(claims.get("email"));

        AppUser user = appUserRepository.findByEmail(email).orElse(null);

        if (user == null) {
            user = createGoogleUser(claims, request.getRole());
        }

        user.setLastLoginAt(LocalDateTime.now());
        appUserRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String accessToken = jwtService.generateToken(userDetails);

        String refreshTokenString = UUID.randomUUID().toString();
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(refreshTokenString)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .revoked(false)
                .createdAt(LocalDateTime.now())
                .build();

        refreshTokenRepository.save(refreshToken);

        Set<String> roles = user.getUserRoles().stream()
                .map(r -> r.getRole().getRoleName())
                .collect(Collectors.toSet());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenString)
                .username(user.getUsername())
                .roles(roles)
                .build();
    }

    private AppUser createGoogleUser(Map<String, Object> claims, String requestedRole) {
        String email = String.valueOf(claims.get("email"));

        String username = email.contains("@") ? email.substring(0, email.indexOf('@')) : email;
        if (appUserRepository.existsByUsername(username)) {
            username = username + String.format("%04d", SECURE_RANDOM.nextInt(10_000));
        }

        String firstName = claims.get("given_name") != null ? String.valueOf(claims.get("given_name")) : "Google";
        String lastName = claims.get("family_name") != null ? String.valueOf(claims.get("family_name")) : "User";

        Institution institution = institutionRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("No default institution exists in the system"));
        Department department = departmentRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("No default department exists in the system"));

        AppUser user = AppUser.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                .firstName(firstName)
                .lastName(lastName)
                .institution(institution)
                .department(department)
                .authProvider("GOOGLE")
                .isActive(true)
                .isVerified(true)
                .status(UserStatus.ACTIVE)
                .userRoles(new HashSet<>())
                .build();

        AppUser savedUser = appUserRepository.save(user);

        String roleName = "STUDENT";
        if (requestedRole != null && !requestedRole.isBlank()
                && OAUTH_ALLOWED_ROLES.contains(requestedRole.toUpperCase())) {
            roleName = requestedRole.toUpperCase();
        }

        final String resolvedRoleName = roleName;
        Role role = roleRepository.findByRoleName(resolvedRoleName)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .roleName(resolvedRoleName)
                        .description(resolvedRoleName + " role")
                        .isSystemRole(false)
                        .build()));

        UserRoleId userRoleId = new UserRoleId(savedUser.getUserId(), role.getRoleId());
        UserRole userRole = UserRole.builder()
                .id(userRoleId)
                .user(savedUser)
                .role(role)
                .createdAt(LocalDateTime.now())
                .build();

        userRoleRepository.save(userRole);
        savedUser.getUserRoles().add(userRole);

        return savedUser;
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken token = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new RuntimeException("Refresh token not found"));
        
        if (Boolean.TRUE.equals(token.getRevoked())) {
            throw new RuntimeException("Refresh token has been revoked");
        }
        
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Refresh token has expired");
        }
        
        AppUser user = token.getUser();
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String newAccessToken = jwtService.generateToken(userDetails);
        
        token.setRevoked(true);
        refreshTokenRepository.save(token);
        
        String newRefreshTokenString = UUID.randomUUID().toString();
        RefreshToken newRefreshToken = RefreshToken.builder()
                .user(user)
                .token(newRefreshTokenString)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .revoked(false)
                .createdAt(LocalDateTime.now())
                .build();
        refreshTokenRepository.save(newRefreshToken);
        
        Set<String> roles = user.getUserRoles().stream()
                .map(r -> r.getRole().getRoleName())
                .collect(Collectors.toSet());
        
        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshTokenString)
                .username(user.getUsername())
                .roles(roles)
                .build();
    }
    
    @Override
    @Transactional
    public ApiResponse<?> forgotPassword(ForgotPasswordRequest request) {
        AppUser user = appUserRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("No account found with this email address"));

        // Generate a 6-digit OTP + a reset-session token used across the 3 steps
        String otp = String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));
        String resetTokenString = UUID.randomUUID().toString();

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .token(resetTokenString)
                .otp(otp)
                .otpVerified(false)
                .attempts(0)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .used(false)
                .createdAt(LocalDateTime.now())
                .build();

        passwordResetTokenRepository.save(resetToken);

        emailService.sendOtpEmail(user.getEmail(), user.getFirstName(), otp);

        return new ApiResponse<>(true,
                "An OTP has been sent to your email. It is valid for 10 minutes.", null);
    }

    @Override
    @Transactional
    public ApiResponse<?> verifyOtp(VerifyOtpRequest request) {
        AppUser user = appUserRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("No account found with this email address"));

        PasswordResetToken resetToken = passwordResetTokenRepository
                .findTopByUser_UserIdOrderByCreatedAtDesc(user.getUserId())
                .orElseThrow(() -> new RuntimeException("No password reset request found. Please request a new OTP."));

        if (Boolean.TRUE.equals(resetToken.getUsed())) {
            throw new RuntimeException("This reset request has already been used. Please request a new OTP.");
        }

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }

        int attempts = resetToken.getAttempts() == null ? 0 : resetToken.getAttempts();
        if (attempts >= MAX_OTP_ATTEMPTS) {
            throw new RuntimeException("Too many incorrect attempts. Please request a new OTP.");
        }

        if (!resetToken.getOtp().equals(request.getOtp())) {
            resetToken.setAttempts(attempts + 1);
            passwordResetTokenRepository.save(resetToken);
            int remaining = MAX_OTP_ATTEMPTS - (attempts + 1);
            throw new RuntimeException("Incorrect OTP. " + remaining + " attempt(s) remaining.");
        }

        resetToken.setOtpVerified(true);
        passwordResetTokenRepository.save(resetToken);

        // Return the reset-session token — required in the final reset-password step
        return new ApiResponse<>(true, "OTP verified successfully", resetToken.getToken());
    }

    @Override
    @Transactional
    public ApiResponse<?> resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getResetToken())
                .orElseThrow(() -> new RuntimeException("Invalid password reset session"));

        if (Boolean.TRUE.equals(resetToken.getUsed())) {
            throw new RuntimeException("This reset session has already been used");
        }

        if (!Boolean.TRUE.equals(resetToken.getOtpVerified())) {
            throw new RuntimeException("OTP has not been verified for this reset session");
        }

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Password reset session has expired. Please start again.");
        }

        AppUser user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        appUserRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        // Revoke all refresh tokens so old sessions can't be reused after reset
        refreshTokenRepository.findAll().stream()
                .filter(t -> t.getUser().getUserId().equals(user.getUserId()) && !Boolean.TRUE.equals(t.getRevoked()))
                .forEach(t -> {
                    t.setRevoked(true);
                    refreshTokenRepository.save(t);
                });

        emailService.sendPasswordChangedEmail(user.getEmail(), user.getFirstName());

        return new ApiResponse<>(true, "Password has been reset successfully. Please login with your new password.", null);
    }
}