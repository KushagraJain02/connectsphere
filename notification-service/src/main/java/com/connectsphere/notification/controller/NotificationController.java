package com.connectsphere.notification.controller;

import com.connectsphere.notification.dto.NotificationResponse;
import com.connectsphere.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // Get all notifications
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(notificationService.getMyNotifications(userId));
    }

    // Get only unread notifications
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }

    // Get unread count
    @GetMapping("/unread/count")
    public ResponseEntity<Long> getUnreadCount(
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }

    // Mark all as read
    @PutMapping("/read-all")
    public ResponseEntity<String> markAllAsRead(
            @RequestHeader("X-User-Id") String userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok("All notifications marked as read");
    }

    // Mark one as read
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<String> markOneAsRead(
            @PathVariable String notificationId,
            @RequestHeader("X-User-Id") String userId) {
        notificationService.markOneAsRead(notificationId, userId);
        return ResponseEntity.ok("Notification marked as read");
    }
}