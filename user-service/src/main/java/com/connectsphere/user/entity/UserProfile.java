package com.connectsphere.user.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "user_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile {

    @Id
    private String userId;  // Same ID as auth-service user

    @Column(nullable = false)
    private String fullName;

    private String email;
    private String headline;
    private String bio;
    private String location;
    private String profilePictureUrl;
    private String resumeUrl;
    private String profilePicturePublicId;  // Cloudinary public id
    private String resumePublicId;

    @ElementCollection
    @CollectionTable(name = "user_skills", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "skill")
    private List<String> skills;

    @ElementCollection
    @CollectionTable(name = "user_experiences", joinColumns = @JoinColumn(name = "user_id"))
    private List<Experience> experiences;

    private int profileViews;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.profileViews = 0;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Experience {
        private String company;
        private String role;
        private String startDate;
        private String endDate;
        private String description;
    }
}