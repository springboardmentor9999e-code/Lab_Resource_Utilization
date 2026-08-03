package com.labresource.controller;

import com.labresource.dto.ForgotPasswordRequest;
import com.labresource.dto.ResetPasswordRequest;
import com.labresource.entity.PasswordResetToken;
import com.labresource.entity.User;
import com.labresource.repository.PasswordResetTokenRepository;
import com.labresource.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class PasswordResetController {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;

    private static final int EXPIRY_MINUTES = 30;

    public PasswordResetController(UserRepository userRepository,
                                   PasswordResetTokenRepository tokenRepository,
                                   PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Step 1: Request a reset — always returns the same generic message,
    // regardless of whether the email exists, to prevent user enumeration.
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody ForgotPasswordRequest request) {

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        String responseToken = null; // only populated for local testing (see note below)

        if (userOpt.isPresent()) {
            String token = UUID.randomUUID().toString();

            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .token(token)
                    .userEmail(request.getEmail())
                    .expiryDate(LocalDateTime.now().plusMinutes(EXPIRY_MINUTES))
                    .used(false)
                    .build();

            tokenRepository.save(resetToken);

            // TODO: In production, email this token to the user via JavaMailSender instead of returning it.
            // For local development/testing (no email service configured yet), we return it directly.
            responseToken = token;
        }

        Map<String, String> response = new java.util.HashMap<>();
        response.put("message", "If an account with that email exists, a reset link has been sent.");
        if (responseToken != null) {
            response.put("devOnlyToken", responseToken); // REMOVE this field once real email sending is wired up
        }

        return ResponseEntity.ok(response);
    }

    // Step 2: Reset the password using the token
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody ResetPasswordRequest request) {

        PasswordResetToken resetToken = tokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

        if (resetToken.isUsed()) {
            throw new RuntimeException("This reset token has already been used");
        }

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("This reset token has expired");
        }

        User user = userRepository.findByEmail(resetToken.getUserEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        return ResponseEntity.ok(Map.of("message", "Password reset successful. You can now log in with your new password."));
    }
}
