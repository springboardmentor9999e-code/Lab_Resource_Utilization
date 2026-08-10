package com.lrplatform.security;

import com.lrplatform.model.entity.RefreshToken;
import com.lrplatform.model.entity.User;
import com.lrplatform.repository.RefreshTokenRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Objects;

@Component
@Slf4j
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtTokenProvider tokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.oauth2.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    public OAuth2AuthenticationSuccessHandler(JwtTokenProvider tokenProvider,
                                              RefreshTokenRepository refreshTokenRepository) {
        this.tokenProvider = tokenProvider;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        CustomOAuth2User oauth2User = (CustomOAuth2User) authentication.getPrincipal();
        String email = oauth2User.getEmail();
        User user = oauth2User.getUser();

        boolean needsSetup = user.getRole().name().equals("RESEARCHER")
                && user.getInstitution() == null && user.getDepartment() == null;

        if (needsSetup) {
            String setupToken = tokenProvider.generateSetupToken(email);
            JwtCookieUtil.addSetupCookie(request, response, setupToken);
            log.info("OAuth2 user needs profile setup: {}", email);
            response.sendRedirect(frontendUrl + "/oauth2/callback?mode=setup");
        } else {
            String accessToken = tokenProvider.generateAccessTokenFromEmail(email);
            String refreshToken = tokenProvider.generateRefreshTokenFromEmail(email);

            RefreshToken refreshEntity = RefreshToken.builder()
                    .user(user)
                    .token(refreshToken)
                    .expiryDate(LocalDateTime.now().plusSeconds(tokenProvider.getRefreshTokenExpiration() / 1000))
                    .build();
            refreshTokenRepository.save(Objects.requireNonNull(refreshEntity));

            JwtCookieUtil.addAccessCookie(request, response, accessToken,
                    tokenProvider.getAccessTokenExpiration() / 1000);
            JwtCookieUtil.addRefreshCookie(request, response, refreshToken,
                    tokenProvider.getRefreshTokenExpiration() / 1000);

            log.info("OAuth2 login successful for user: {}", email);
            response.sendRedirect(frontendUrl + "/oauth2/callback?mode=login");
        }
    }
}
