package com.connectsphere.user.dto;

import com.connectsphere.user.entity.UserProfile;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class UserProfileResponse {
    private String userId;
    private String fullName;
    private String email;
    private String headline;
    private String bio;
    private String location;
    private String profilePictureUrl;
    private String resumeUrl;
    private List<String> skills;
    private List<UserProfile.Experience> experiences;
    private int profileViews;

    public static UserProfileResponse fromEntity(UserProfile profile) {
        return UserProfileResponse.builder()
                .userId(profile.getUserId())
                .fullName(profile.getFullName())
                .email(profile.getEmail())
                .headline(profile.getHeadline())
                .bio(profile.getBio())
                .location(profile.getLocation())
                .profilePictureUrl(profile.getProfilePictureUrl())
                .resumeUrl(profile.getResumeUrl())
                .skills(profile.getSkills())
                .experiences(profile.getExperiences())
                .profileViews(profile.getProfileViews())
                .build();
    }
}