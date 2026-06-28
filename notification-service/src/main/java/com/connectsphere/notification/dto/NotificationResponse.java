package com.connectsphere.notification.dto;

import com.connectsphere.notification.entity.Notification;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private String id;
    private String recipientId;
    private String actorId;
    private String actorName;
    private String type;
    private String message;
    private String referenceId;
    private boolean read;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;

    public static NotificationResponse fromEntity(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .recipientId(n.getRecipientId())
                .actorId(n.getActorId())
                .actorName(n.getActorName())
                .type(n.getType().name())
                .message(n.getMessage())
                .referenceId(n.getReferenceId())
                .read(n.isRead())
                .readAt(n.getReadAt())
                .createdAt(n.getCreatedAt())
                .build();
    }
}