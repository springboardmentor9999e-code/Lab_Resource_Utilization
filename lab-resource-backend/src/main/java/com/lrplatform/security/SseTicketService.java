package com.lrplatform.security;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SseTicketService {

    private static final long TTL_MS = 60_000;

    private final Map<String, Ticket> tickets = new ConcurrentHashMap<>();
    private final SecureRandom secureRandom = new SecureRandom();

    public String create(Long userId) {
        String ticket = generateToken();
        tickets.put(ticket, new Ticket(userId, System.currentTimeMillis()));
        return ticket;
    }

    public Long consume(String ticket) {
        if (ticket == null || ticket.isBlank()) {
            return null;
        }
        Ticket stored = tickets.remove(ticket);
        if (stored == null) {
            return null;
        }
        if (System.currentTimeMillis() - stored.createdAt() > TTL_MS) {
            return null;
        }
        return stored.userId();
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        StringBuilder sb = new StringBuilder(64);
        for (byte b : bytes) {
            sb.append(Character.forDigit((b >> 4) & 0xF, 16));
            sb.append(Character.forDigit(b & 0xF, 16));
        }
        return sb.toString();
    }

    private record Ticket(Long userId, long createdAt) {
    }
}
