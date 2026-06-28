package com.connectsphere.notification.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String recipientId;

    private String recipientEmail;

    @Column(nullable = false)
    private String actorId;

    private String actorName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(columnDefinition = "TEXT")
    private String message;

    private String referenceId;   // postId, connectionId, messageId

    private boolean read;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.read = false;
    }

    public enum NotificationType {
        POST_LIKED,
        POST_COMMENTED,
        POST_CREATED,
        CONNECTION_REQUESTED,
        CONNECTION_ACCEPTED,
        MESSAGE_RECEIVED
    }
}