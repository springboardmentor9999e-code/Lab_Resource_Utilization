package com.labresource.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

/**
 * Broadcasts live utilization events to connected dashboards.
 *
 * A plain text handler rather than STOMP/SockJS on purpose: the traffic here is strictly one-way
 * server-to-client notification, so the extra protocol layers (and the client libraries they drag
 * in) would buy nothing. The browser's native WebSocket is enough.
 *
 * Payloads are deliberately small — an event saying *what* changed, not a whole recomputed summary.
 * Recomputing and pushing the full utilization picture on every booking transition would put real
 * query load on the database for every connected tab; instead clients debounce and refetch.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class UtilizationWebSocketHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper;

    /**
     * Copy-on-write because the read path (broadcast) massively outnumbers connect/disconnect,
     * and it lets us iterate without holding a lock while doing socket I/O.
     */
    private final Set<WebSocketSession> sessions = new CopyOnWriteArraySet<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sessions.add(session);
        log.debug("Utilization socket opened for {} ({} live)",
                session.getAttributes().get("username"), sessions.size());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session);
        log.debug("Utilization socket closed ({} live)", sessions.size());
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        // A broken pipe is routine (tab closed, laptop slept) — drop the session, do not shout
        log.debug("Utilization socket transport error: {}", exception.getMessage());
        sessions.remove(session);
    }

    /**
     * Fans an event out to every connected client.
     *
     * Never throws: a dashboard failing to receive a nudge must not roll back the booking
     * transaction that triggered it.
     */
    public void broadcast(String eventType, Map<String, Object> payload) {
        if (sessions.isEmpty()) {
            return;
        }

        String json;
        try {
            Map<String, Object> envelope = new java.util.LinkedHashMap<>();
            envelope.put("event", eventType);
            envelope.putAll(payload);
            json = objectMapper.writeValueAsString(envelope);
        } catch (Exception ex) {
            log.warn("Could not serialise utilization event {}: {}", eventType, ex.getMessage());
            return;
        }

        TextMessage message = new TextMessage(json);
        for (WebSocketSession session : sessions) {
            if (!session.isOpen()) {
                sessions.remove(session);
                continue;
            }
            try {
                // Synchronise per session: concurrent sends on one WebSocketSession are illegal
                synchronized (session) {
                    session.sendMessage(message);
                }
            } catch (IOException | IllegalStateException ex) {
                log.debug("Dropping utilization socket after send failure: {}", ex.getMessage());
                sessions.remove(session);
            }
        }
    }

    /** Live connection count — surfaced for diagnostics. */
    public int connectionCount() {
        return sessions.size();
    }
}
