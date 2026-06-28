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
public class ConnectionEventConsumer {

    private final NotificationService notificationService;

    @KafkaListener(topics = "connection-events", groupId = "notification-service")
    public void handleConnectionEvent(Map<String, Object> event) {
        try {
            String eventType = (String) event.get("eventType");
            String senderId = (String) event.get("senderId");
            String senderName = (String) event.get("senderName");
            String receiverId = (String) event.get("receiverId");
            String receiverName = (String) event.get("receiverName");

            log.info("Received connection event: {}", eventType);

            switch (eventType) {
                case "CONNECTION_REQUESTED" -> notificationService.createNotification(
                        receiverId, null, senderId, senderName,
                        Notification.NotificationType.CONNECTION_REQUESTED,
                        senderName + " sent you a connection request",
                        senderId);

                case "CONNECTION_ACCEPTED" -> notificationService.createNotification(
                        senderId, null, receiverId, receiverName,
                        Notification.NotificationType.CONNECTION_ACCEPTED,
                        receiverName + " accepted your connection request",
                        receiverId);
            }
        } catch (Exception e) {
            log.error("Error processing connection event: {}", e.getMessage());
        }
    }
}