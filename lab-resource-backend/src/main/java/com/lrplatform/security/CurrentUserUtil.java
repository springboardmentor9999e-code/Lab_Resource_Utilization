package com.lrplatform.security;

import com.lrplatform.exception.UnauthorizedException;
import com.lrplatform.model.entity.User;
import com.lrplatform.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CurrentUserUtil {

    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;

    public User getCurrentUser(HttpServletRequest request) {
        String token = extractToken(request);
        String email = tokenProvider.getEmailFromToken(token);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
    }

    public Long getCurrentUserId(HttpServletRequest request) {
        return getCurrentUser(request).getId();
    }

    public String getCurrentUserName(HttpServletRequest request) {
        User user = getCurrentUser(request);
        return user.getFirstName() + " " + user.getLastName();
    }

    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken == null || !bearerToken.startsWith("Bearer ")) {
            throw new UnauthorizedException("Missing or invalid Authorization header");
        }
        return bearerToken.substring(7);
    }
}
