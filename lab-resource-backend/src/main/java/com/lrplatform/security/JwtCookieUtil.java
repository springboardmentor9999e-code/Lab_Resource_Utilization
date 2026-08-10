package com.lrplatform.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Builds the httpOnly auth cookies used for the stateless JWT flow.
 *
 * Tokens never travel through JavaScript: the access token is sent on every
 * API request, the refresh token is path-scoped to the auth endpoints only,
 * and the OAuth setup token is scoped to the profile-completion step. All are
 * httpOnly + SameSite=Strict so a successful XSS cannot read or replay them,
 * and cross-site requests never carry them (CSRF mitigation).
 */
public final class JwtCookieUtil {

    public static final String ACCESS_COOKIE = "lrp_access_token";
    public static final String REFRESH_COOKIE = "lrp_refresh_token";
    public static final String SETUP_COOKIE = "lrp_setup_token";

    public static final String ACCESS_COOKIE_PATH = "/";
    public static final String REFRESH_COOKIE_PATH = "/api/auth";
    public static final String SETUP_COOKIE_PATH = "/";
    public static final String SAME_SITE = "Strict";
    public static final int SETUP_COOKIE_MAX_AGE = 600;

    private JwtCookieUtil() {
    }

    public static void addAccessCookie(HttpServletRequest request, HttpServletResponse response,
                                       String token, long maxAgeSeconds) {
        addCookie(response, ACCESS_COOKIE, token, ACCESS_COOKIE_PATH, true, isSecure(request), maxAgeSeconds);
    }

    public static void addRefreshCookie(HttpServletRequest request, HttpServletResponse response,
                                        String token, long maxAgeSeconds) {
        addCookie(response, REFRESH_COOKIE, token, REFRESH_COOKIE_PATH, true, isSecure(request), maxAgeSeconds);
    }

    public static void addSetupCookie(HttpServletRequest request, HttpServletResponse response, String token) {
        addCookie(response, SETUP_COOKIE, token, SETUP_COOKIE_PATH, true, isSecure(request), SETUP_COOKIE_MAX_AGE);
    }

    public static void clearSetupCookie(HttpServletRequest request, HttpServletResponse response) {
        addCookie(response, SETUP_COOKIE, "", SETUP_COOKIE_PATH, true, isSecure(request), 0);
    }

    public static void clearAuthCookies(HttpServletRequest request, HttpServletResponse response) {
        addCookie(response, ACCESS_COOKIE, "", ACCESS_COOKIE_PATH, true, isSecure(request), 0);
        addCookie(response, REFRESH_COOKIE, "", REFRESH_COOKIE_PATH, true, isSecure(request), 0);
        addCookie(response, SETUP_COOKIE, "", SETUP_COOKIE_PATH, true, isSecure(request), 0);
    }

    public static String getCookieValue(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (name.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    private static void addCookie(HttpServletResponse response, String name, String value, String path,
                                  boolean httpOnly, boolean secure, long maxAgeSeconds) {
        Cookie cookie = new Cookie(name, value);
        cookie.setPath(path);
        cookie.setHttpOnly(httpOnly);
        cookie.setSecure(secure);
        cookie.setMaxAge((int) maxAgeSeconds);
        cookie.setAttribute("SameSite", SAME_SITE);
        response.addCookie(cookie);
    }

    private static boolean isSecure(HttpServletRequest request) {
        return request != null && request.isSecure();
    }
}
