package com.lrplatform.service;

import com.lrplatform.model.entity.Notification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@Slf4j
public class NotificationSseService {

    private static final long EMITTER_TIMEOUT_MS = 60_000;

    private final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(Long userId) {
        SseEmitter emitter = new SseEmitter(EMITTER_TIMEOUT_MS);
        emitter.onCompletion(() -> remove(userId, emitter));
        emitter.onTimeout(() -> remove(userId, emitter));
        emitter.onError(e -> remove(userId, emitter));
        emitters.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(emitter);
        return emitter;
    }

    public void broadcast(Long userId, Notification notification) {
        List<SseEmitter> userEmitters = emitters.get(userId);
        if (userEmitters == null || userEmitters.isEmpty()) {
            return;
        }

        Map<String, Object> payload = Map.of(
                "id", notification.getId(),
                "title", notification.getTitle(),
                "message", notification.getMessage() != null
                        ? notification.getMessage().replaceAll("<[^>]*>", "") : "",
                "type", notification.getNotificationType() != null
                        ? notification.getNotificationType().name() : "GENERAL",
                "priority", notification.getPriority() != null
                        ? notification.getPriority().name() : "MEDIUM"
        );

        for (SseEmitter emitter : userEmitters) {
            try {
                emitter.send(SseEmitter.event().data(payload));
            } catch (IOException | IllegalStateException e) {
                remove(userId, emitter);
            }
        }
    }

    private void remove(Long userId, SseEmitter emitter) {
        List<SseEmitter> userEmitters = emitters.get(userId);
        if (userEmitters != null) {
            userEmitters.remove(emitter);
            if (userEmitters.isEmpty()) {
                emitters.remove(userId);
            }
        }
    }
}
