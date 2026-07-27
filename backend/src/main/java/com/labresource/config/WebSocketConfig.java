package com.labresource.config;

import com.labresource.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

/**
 * Registers the real-time utilization socket.
 *
 * Authentication happens in the handshake. Browsers cannot set an Authorization header on a
 * WebSocket, so the JWT arrives as a query parameter and is verified before the connection is
 * upgraded — an unauthenticated client never gets a socket at all, rather than being connected and
 * then filtered.
 */
@Configuration
@EnableWebSocket
@RequiredArgsConstructor
@Slf4j
public class WebSocketConfig implements WebSocketConfigurer {

    private final UtilizationWebSocketHandler utilizationWebSocketHandler;
    private final JwtService jwtService;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(utilizationWebSocketHandler, "/ws/utilization")
                .addInterceptors(new JwtHandshakeInterceptor(jwtService))
                // Mirrors the CORS origins in SecurityConfig; the WebSocket handshake is not
                // covered by the Spring Security CORS configuration
                .setAllowedOrigins(
                        "http://localhost:5173",
                        "http://localhost:5174",
                        "http://localhost:3000");
    }

    /** Rejects the upgrade unless the query string carries a valid, unexpired token. */
    @RequiredArgsConstructor
    @Slf4j
    static class JwtHandshakeInterceptor implements HandshakeInterceptor {

        private final JwtService jwtService;

        @Override
        public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                       WebSocketHandler wsHandler, Map<String, Object> attributes) {
            String token = extractToken(request.getURI().getQuery());
            if (token == null) {
                log.debug("Rejecting utilization socket handshake: no token supplied");
                return false;
            }
            try {
                String username = jwtService.extractUsername(token);
                if (username == null || username.isBlank()) {
                    return false;
                }
                // Stash it so the handler can attribute the connection in logs
                attributes.put("username", username);
                return true;
            } catch (Exception ex) {
                log.debug("Rejecting utilization socket handshake: {}", ex.getMessage());
                return false;
            }
        }

        @Override
        public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Exception exception) {
            // nothing to do
        }

        private String extractToken(String query) {
            if (query == null || query.isBlank()) {
                return null;
            }
            for (String pair : query.split("&")) {
                int eq = pair.indexOf('=');
                if (eq > 0 && "token".equals(pair.substring(0, eq))) {
                    String value = pair.substring(eq + 1);
                    return value.isBlank() ? null : value;
                }
            }
            return null;
        }
    }
}
