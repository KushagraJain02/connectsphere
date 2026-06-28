package com.connectsphere.user.dto;

import com.connectsphere.user.entity.UserProfile;
import lombok.Data;
import java.util.List;

@Data
public class UpdateProfileRequest {
    private String fullName;
    private String headline;
    private String bio;
    private String location;
    private List<String> skills;
    private List<UserProfile.Experience> experiences;
}