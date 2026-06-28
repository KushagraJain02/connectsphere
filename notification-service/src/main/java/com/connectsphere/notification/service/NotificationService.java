package com.connectsphere.notification.service;

import com.connectsphere.notification.dto.NotificationResponse;
import com.connectsphere.notification.entity.Notification;
import com.connectsphere.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;

    public void createNotification(String recipientId, String recipientEmail,
                                   String actorId, String actorName,
                                   Notification.NotificationType type,
                                   String message, String referenceId) {
        // Don't notify yourself
        if (recipientId.equals(actorId)) return;

        Notification notification = Notification.builder()
                .recipientId(recipientId)
                .recipientEmail(recipientEmail)
                .actorId(actorId)
                .actorName(actorName)
                .type(type)
                .message(message)
                .referenceId(referenceId)
                .build();

        notificationRepository.save(notification);
        log.info("Notification created for {} — {}", recipientId, type);

        // Send email if recipient email available
        if (recipientEmail != null && !recipientEmail.isBlank()) {
            emailService.sendEmail(recipientEmail,
                    "ConnectSphere — " + formatSubject(type),
                    message);
        }
    }

    public List<NotificationResponse> getMyNotifications(String userId) {
        return notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<NotificationResponse> getUnreadNotifications(String userId) {
        return notificationRepository
                .findByRecipientIdAndReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByRecipientIdAndReadFalse(userId);
    }

    public void markAllAsRead(String userId) {
        notificationRepository.markAllAsRead(userId);
    }

    public void markOneAsRead(String notificationId, String userId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getRecipientId().equals(userId)) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }

    private String formatSubject(Notification.NotificationType type) {
        return switch (type) {
            case POST_LIKED -> "Someone liked your post";
            case POST_COMMENTED -> "Someone commented on your post";
            case POST_CREATED -> "New post from your connection";
            case CONNECTION_REQUESTED -> "New connection request";
            case CONNECTION_ACCEPTED -> "Connection request accepted";
            case MESSAGE_RECEIVED -> "You have a new message";
        };
    }
}