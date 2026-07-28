package com.lrplatform.security;

import com.lrplatform.model.entity.User;
import com.lrplatform.model.enums.UserRole;
import com.lrplatform.repository.RoleConfigRepository;
import com.lrplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final UserRepository userRepository;
    private final RoleConfigRepository roleConfigRepository;
    private final PasswordEncoder passwordEncoder;
    private final DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = delegate.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        String googleId = oauth2User.getAttribute("sub");

        if (email == null || email.isEmpty()) {
            throw new OAuth2AuthenticationException("Email not found from Google OAuth2");
        }

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            String[] nameParts = name != null ? name.split(" ", 2) : new String[]{"User", ""};
            user = User.builder()
                    .firstName(nameParts[0])
                    .lastName(nameParts.length > 1 ? nameParts[1] : "")
                    .email(email)
                    .oauthProvider(registrationId)
                    .oauthProviderId(googleId)
                    .role(UserRole.RESEARCHER)
                    .status(true)
                    .password(passwordEncoder.encode("OAUTH_USER_NO_PASSWORD"))
                    .build();
            user = userRepository.save(Objects.requireNonNull(user));
            log.info("New user created via Google OAuth: {}", email);
        } else {
            if (!user.getStatus()) {
                throw new OAuth2AuthenticationException("Your account has been deactivated. Please contact your administrator.");
            }

            roleConfigRepository.findByRoleName(user.getRole().name())
                    .filter(rc -> !rc.getEnabled())
                    .ifPresent(rc -> {
                        throw new OAuth2AuthenticationException("Role '" + rc.getRoleName() + "' is disabled");
                    });

            if (user.getOauthProvider() == null) {
                user.setOauthProvider(registrationId);
                user.setOauthProviderId(googleId);
                userRepository.save(user);
            }
            log.info("Existing user logged in via Google OAuth: {}", email);
        }

        return new CustomOAuth2User(oauth2User, user);
    }
}
