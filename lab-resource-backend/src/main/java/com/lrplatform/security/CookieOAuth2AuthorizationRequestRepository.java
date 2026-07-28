package com.lrplatform.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.*;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Optional;

@Component
public class CookieOAuth2AuthorizationRequestRepository implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {

    private static final String COOKIE_NAME = "oauth2_auth_request";
    private static final String REDIRECT_URI_COOKIE_NAME = "oauth2_redirect_uri";
    private static final int COOKIE_EXPIRY_SECONDS = 600;
    private static final String SAME_SITE = "Lax";

    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(HttpServletRequest request) {
        return getCookieValue(request, COOKIE_NAME)
                .map(this::deserialize)
                .orElse(null);
    }

    @Override
    public void saveAuthorizationRequest(OAuth2AuthorizationRequest authorizationRequest,
                                         HttpServletRequest request, HttpServletResponse response) {
        if (authorizationRequest == null) {
            removeAuthorizationRequest(request, response);
            return;
        }

        String serialized = serialize(authorizationRequest);
        addCookie(COOKIE_NAME, serialized, request, response);

        String redirectUri = request.getParameter(OAuth2ParameterNames.REDIRECT_URI);
        if (StringUtils.hasText(redirectUri)) {
            addCookie(REDIRECT_URI_COOKIE_NAME, redirectUri, request, response);
        }
    }

    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(HttpServletRequest request,
                                                                 HttpServletResponse response) {
        Optional<OAuth2AuthorizationRequest> authRequest = getCookieValue(request, COOKIE_NAME)
                .map(this::deserialize);

        removeCookie(COOKIE_NAME, request, response);
        removeCookie(REDIRECT_URI_COOKIE_NAME, request, response);

        return authRequest.orElse(null);
    }

    private void addCookie(String name, String value, HttpServletRequest request, HttpServletResponse response) {
        Cookie cookie = new Cookie(name, encode(value));
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setMaxAge(COOKIE_EXPIRY_SECONDS);
        cookie.setAttribute("SameSite", SAME_SITE);
        response.addCookie(cookie);
    }

    private void removeCookie(String name, HttpServletRequest request, HttpServletResponse response) {
        Cookie cookie = new Cookie(name, "");
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setMaxAge(0);
        cookie.setAttribute("SameSite", SAME_SITE);
        response.addCookie(cookie);
    }

    private Optional<String> getCookieValue(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return Optional.empty();
        for (Cookie cookie : cookies) {
            if (cookie.getName().equals(name)) {
                return Optional.ofNullable(decode(cookie.getValue()));
            }
        }
        return Optional.empty();
    }

    private String serialize(OAuth2AuthorizationRequest request) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ObjectOutputStream oos = new ObjectOutputStream(baos);
            oos.writeObject(request);
            oos.close();
            return Base64.getUrlEncoder().withoutPadding().encodeToString(baos.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Failed to serialize OAuth2AuthorizationRequest", e);
        }
    }

    private OAuth2AuthorizationRequest deserialize(String value) {
        try {
            byte[] bytes = Base64.getUrlDecoder().decode(value);
            ByteArrayInputStream bais = new ByteArrayInputStream(bytes);
            ObjectInputStream ois = new ObjectInputStream(bais);
            OAuth2AuthorizationRequest request = (OAuth2AuthorizationRequest) ois.readObject();
            ois.close();
            return request;
        } catch (Exception e) {
            return null;
        }
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }

    private String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }

    private static class OAuth2ParameterNames {
        static final String REDIRECT_URI = "redirect_uri";
    }
}
