package com.connectsphere.messaging.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "conversations",
        uniqueConstraints = @UniqueConstraint(columnNames = {"participant_one", "participant_two"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "participant_one", nullable = false)
    private String participantOne;

    private String participantOneName;

    @Column(name = "participant_two", nullable = false)
    private String participantTwo;

    private String participantTwoName;

    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private int unreadCountOne;
    private int unreadCountTwo;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.unreadCountOne = 0;
        this.unreadCountTwo = 0;
    }
}