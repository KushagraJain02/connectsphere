package com.connectsphere.post.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "reactions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"post_id", "user_id"})
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Reaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "post_id", nullable = false)
    private String postId;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "user_name")
    private String userName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReactionType type;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum ReactionType {
        LIKE,       // 👍
        CELEBRATE,  // 🎉
        SUPPORT,    // 🤝
        INSIGHTFUL, // 💡
        FUNNY       // 😄
    }
}