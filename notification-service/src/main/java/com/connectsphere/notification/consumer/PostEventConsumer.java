package com.connectsphere.notification.consumer;

import com.connectsphere.notification.entity.Notification;
import com.connectsphere.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class PostEventConsumer {

    private final NotificationService notificationService;

    @KafkaListener(topics = "post-events", groupId = "notification-service")
    public void handlePostEvent(Map<String, Object> event) {
        try {
            String eventType = (String) event.get("eventType");
            String postId = (String) event.get("postId");
            String authorId = (String) event.get("authorId");
            String actorId = (String) event.get("actorId");
            String actorName = (String) event.get("actorName");
            String content = (String) event.get("content");

            log.info("Received post event: {}", eventType);

            switch (eventType) {
                case "POST_LIKED" -> notificationService.createNotification(
                        authorId, null, actorId, actorName,
                        Notification.NotificationType.POST_LIKED,
                        actorName + " liked your post",
                        postId);

                case "POST_COMMENTED" -> notificationService.createNotification(
                        authorId, null, actorId, actorName,
                        Notification.NotificationType.POST_COMMENTED,
                        actorName + " commented on your post: \"" + content + "\"",
                        postId);

                case "POST_CREATED" -> notificationService.createNotification(
                        authorId, null, actorId, actorName,
                        Notification.NotificationType.POST_CREATED,
                        actorName + " created a new post",
                        postId);
            }
        } catch (Exception e) {
            log.error("Error processing post event: {}", e.getMessage());
        }
    }
}