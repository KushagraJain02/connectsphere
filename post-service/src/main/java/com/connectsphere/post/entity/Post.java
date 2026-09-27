package com.connectsphere.post.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String authorId;

    private String authorName;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String imageUrl;
    private String imagePublicId;

    @Enumerated(EnumType.STRING)
    private PostType type;

    private int likeCount;
    private int commentCount;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;


    // Add inside Post entity class
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "post_hashtags", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "hashtag")
    private List<String> hashtags = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.likeCount = 0;
        this.commentCount = 0;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum PostType {
        TEXT, IMAGE, ARTICLE
    }
}