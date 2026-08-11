package com.labplatform.labresourceplatform.controller;

import com.labplatform.labresourceplatform.entity.Notification;
import com.labplatform.labresourceplatform.entity.User;
import com.labplatform.labresourceplatform.security.CurrentUserService;
import com.labplatform.labresourceplatform.service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final CurrentUserService currentUserService;

    public NotificationController(NotificationService notificationService, CurrentUserService currentUserService) {
        this.notificationService = notificationService;
        this.currentUserService = currentUserService;
    }

    // No @PreAuthorize beyond being authenticated - every role can have
    // notifications (though in practice only staff roles currently receive
    // any, per NotificationService.notifyEquipmentStaff), and this only ever
    // returns the CURRENT user's own notifications, never anyone else's.
    @GetMapping
    public List<Notification> getMyNotifications(@RequestParam(defaultValue = "false") boolean unreadOnly) {
        User currentUser = currentUserService.getCurrentUser();
        return unreadOnly ? notificationService.getUnreadForUser(currentUser) : notificationService.getForUser(currentUser);
    }

    @PutMapping("/{id}/read")
    public Notification markRead(@PathVariable Long id) {
        User currentUser = currentUserService.getCurrentUser();
        return notificationService.markRead(id, currentUser);
    }

    @PutMapping("/read-all")
    public void markAllRead() {
        User currentUser = currentUserService.getCurrentUser();
        notificationService.markAllRead(currentUser);
    }
}
