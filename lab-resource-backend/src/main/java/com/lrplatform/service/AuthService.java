package com.lrplatform.service;

import com.lrplatform.dto.request.CompleteProfileRequest;
import com.lrplatform.dto.request.LoginRequest;
import com.lrplatform.dto.request.RegisterRequest;
import com.lrplatform.dto.response.AuthResponse;
import com.lrplatform.exception.BadRequestException;
import com.lrplatform.exception.DuplicateResourceException;
import com.lrplatform.model.entity.Department;
import com.lrplatform.model.entity.Institution;
import com.lrplatform.model.entity.PasswordResetToken;
import com.lrplatform.model.entity.RefreshToken;
import com.lrplatform.model.entity.User;
import com.lrplatform.model.enums.UserRole;
import com.lrplatform.repository.DepartmentRepository;
import com.lrplatform.repository.InstitutionRepository;
import com.lrplatform.repository.PasswordResetTokenRepository;
import com.lrplatform.repository.RefreshTokenRepository;
import com.lrplatform.repository.UserRepository;
import com.lrplatform.security.JwtTokenProvider;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;
    private final AuditLogService auditLogService;
    private final InstitutionRepository institutionRepository;
    private final DepartmentRepository departmentRepository;

    @Transactional
    public AuthResponse login(LoginRequest request) {
        HttpServletRequest httpRequest = getRequest();
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            String accessToken = tokenProvider.generateAccessTokenFromEmail(request.getEmail());
            String refreshToken = tokenProvider.generateRefreshTokenFromEmail(request.getEmail());

            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new BadRequestException("User not found"));

            RefreshToken refreshEntity = RefreshToken.builder()
                    .user(user)
                    .token(refreshToken)
                    .expiryDate(LocalDateTime.now().plusSeconds(tokenProvider.getRefreshTokenExpiration() / 1000))
                    .build();
            refreshTokenRepository.save(Objects.requireNonNull(refreshEntity));

            log.info("User logged in successfully: {}", request.getEmail());
            auditLogService.log(user, "AUTH", "LOGIN", "User", user.getId(),
                    null, "User logged in", httpRequest);

            return AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .role(user.getRole().name())
                    .email(user.getEmail())
                    .fullName(user.getFirstName() + " " + user.getLastName())
                    .userId(user.getId())
                    .institutionId(user.getInstitution() != null ? user.getInstitution().getId() : null)
                    .departmentId(user.getDepartment() != null ? user.getDepartment().getId() : null)
                    .build();
        } catch (BadCredentialsException e) {
            User failedUser = userRepository.findByEmail(request.getEmail()).orElse(null);
            auditLogService.logFailure(failedUser, "AUTH", "LOGIN_FAILED", "User",
                    failedUser != null ? failedUser.getId() : null, "Invalid credentials", httpRequest);
            throw e;
        }
    }

    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }

        if (request.getPhone() != null && userRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Phone number already registered: " + request.getPhone());
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.RESEARCHER)
                .status(true)
                .build();

        userRepository.save(Objects.requireNonNull(user));
        log.info("User registered successfully: {}", request.getEmail());
        auditLogService.log(user, "AUTH", "REGISTER", "User", user.getId(),
                null, "User registered with role RESEARCHER", getRequest());
    }

    @Transactional
    public AuthResponse refreshToken(String refreshTokenValue) {
        if (!tokenProvider.validateToken(refreshTokenValue)) {
            throw new BadRequestException("Invalid or expired refresh token");
        }

        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenValue)
                .orElseThrow(() -> new BadRequestException("Refresh token not found"));

        if (refreshToken.isExpired() || refreshToken.getRevoked()) {
            throw new BadRequestException("Refresh token is expired or revoked");
        }

        User user = refreshToken.getUser();
        String newAccessToken = tokenProvider.generateAccessTokenFromEmail(user.getEmail());
        String newRefreshToken = tokenProvider.generateRefreshTokenFromEmail(user.getEmail());

        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        RefreshToken newRefreshEntity = RefreshToken.builder()
                .user(user)
                .token(newRefreshToken)
                .expiryDate(LocalDateTime.now().plusSeconds(tokenProvider.getRefreshTokenExpiration() / 1000))
                .build();
        refreshTokenRepository.save(Objects.requireNonNull(newRefreshEntity));

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .role(user.getRole().name())
                .email(user.getEmail())
                .fullName(user.getFirstName() + " " + user.getLastName())
                .userId(user.getId())
                .institutionId(user.getInstitution() != null ? user.getInstitution().getId() : null)
                .departmentId(user.getDepartment() != null ? user.getDepartment().getId() : null)
                .build();
    }

    @Transactional
    public void logout(String refreshTokenValue) {
        if (refreshTokenValue != null) {
            refreshTokenRepository.findByToken(refreshTokenValue)
                    .ifPresent(token -> {
                        User tokenUser = token.getUser();
                        token.setRevoked(true);
                        refreshTokenRepository.save(token);
                        auditLogService.log(tokenUser, "AUTH", "LOGOUT", "User", tokenUser.getId(),
                                null, "User logged out", getRequest());
                    });
        }
        SecurityContextHolder.clearContext();
        log.info("User logged out successfully");
    }

    @Transactional
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("No account found with this email"));

        String resetToken = UUID.randomUUID().toString();
        PasswordResetToken passwordResetToken = PasswordResetToken.builder()
                .user(user)
                .token(resetToken)
                .expiry(LocalDateTime.now().plusHours(1))
                .build();

        passwordResetTokenRepository.save(Objects.requireNonNull(passwordResetToken));
        log.info("Password reset token generated for user: {}", email);
        emailService.sendPasswordResetEmail(email, resetToken);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid reset token"));

        if (resetToken.isExpired() || resetToken.getUsed()) {
            throw new BadRequestException("Reset token is expired or already used");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        log.info("Password reset successfully for user: {}", user.getEmail());
    }

    private HttpServletRequest getRequest() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attrs != null ? attrs.getRequest() : null;
    }

    @Transactional
    public AuthResponse completeOAuthProfile(CompleteProfileRequest request) {
        String email;
        String tokenType;
        try {
            email = tokenProvider.getEmailFromToken(request.getSetupToken());
            tokenType = tokenProvider.getClaimFromToken(request.getSetupToken(), "type");
        } catch (JwtException e) {
            throw new BadRequestException("Invalid or expired setup token");
        }

        if (!"setup".equals(tokenType)) {
            throw new BadRequestException("Invalid setup token");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));

        try {
            UserRole newRole = UserRole.valueOf(request.getRole());
            user.setRole(newRole);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role: " + request.getRole());
        }

        Institution institution;
        if (request.getInstitutionId() != null) {
            institution = institutionRepository.findById(request.getInstitutionId())
                    .orElseThrow(() -> new BadRequestException("Institution not found"));
        } else if (request.getCustomInstitutionName() != null && !request.getCustomInstitutionName().trim().isEmpty()) {
            institution = Institution.builder()
                    .institutionCode("CUSTOM-" + System.currentTimeMillis() % 100000)
                    .institutionName(request.getCustomInstitutionName().trim())
                    .status(true)
                    .build();
            institution = institutionRepository.save(institution);
        } else {
            throw new BadRequestException("Please select an institution or enter a custom institution name");
        }

        user.setInstitution(institution);

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new BadRequestException("Department not found"));
            user.setDepartment(department);
        }

        userRepository.save(user);

        String accessToken = tokenProvider.generateAccessTokenFromEmail(email);
        String refreshToken = tokenProvider.generateRefreshTokenFromEmail(email);

        RefreshToken refreshEntity = RefreshToken.builder()
                .user(user)
                .token(refreshToken)
                .expiryDate(LocalDateTime.now().plusSeconds(tokenProvider.getRefreshTokenExpiration() / 1000))
                .build();
        refreshTokenRepository.save(Objects.requireNonNull(refreshEntity));

        auditLogService.log(user, "AUTH", "OAUTH_SETUP_COMPLETE", "User", user.getId(),
                null, "Role set to " + user.getRole().name(), getRequest());

        log.info("OAuth2 profile completed for user: {}, role: {}", email, user.getRole().name());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .role(user.getRole().name())
                .email(user.getEmail())
                .fullName(user.getFirstName() + " " + user.getLastName())
                .userId(user.getId())
                .institutionId(institution.getId())
                .departmentId(user.getDepartment() != null ? user.getDepartment().getId() : null)
                .build();
    }
}
