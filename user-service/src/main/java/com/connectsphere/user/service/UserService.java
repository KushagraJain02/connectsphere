package com.connectsphere.user.service;

import com.connectsphere.user.dto.UpdateProfileRequest;
import com.connectsphere.user.dto.UserProfileResponse;
import com.connectsphere.user.entity.UserProfile;
import com.connectsphere.user.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserProfileRepository userProfileRepository;
    private final CloudinaryService cloudinaryService;

    public UserProfileResponse createProfile(String userId, String fullName, String email) {
        if (userProfileRepository.existsById(userId)) {
            return UserProfileResponse.fromEntity(userProfileRepository.findById(userId).get());
        }
        UserProfile profile = UserProfile.builder()
                .userId(userId)
                .fullName(fullName)
                .email(email)
                .build();
        return UserProfileResponse.fromEntity(userProfileRepository.save(profile));
    }

    public UserProfileResponse getProfile(String userId) {
        UserProfile profile = findProfileById(userId);
        userProfileRepository.incrementProfileViews(userId);
        return UserProfileResponse.fromEntity(profile);
    }

    public UserProfileResponse getMyProfile(String userId) {
        return UserProfileResponse.fromEntity(findProfileById(userId));
    }

    public UserProfileResponse updateProfile(String userId, UpdateProfileRequest request) {
        UserProfile profile = findProfileById(userId);
        if (request.getFullName() != null) profile.setFullName(request.getFullName());
        if (request.getHeadline() != null) profile.setHeadline(request.getHeadline());
        if (request.getBio() != null) profile.setBio(request.getBio());
        if (request.getLocation() != null) profile.setLocation(request.getLocation());
        if (request.getSkills() != null) profile.setSkills(request.getSkills());
        if (request.getExperiences() != null) profile.setExperiences(request.getExperiences());
        return UserProfileResponse.fromEntity(userProfileRepository.save(profile));
    }

    public UserProfileResponse uploadProfilePicture(String userId, MultipartFile file) throws IOException {
        UserProfile profile = findProfileById(userId);
        if (profile.getProfilePicturePublicId() != null) {
            cloudinaryService.deleteFile(profile.getProfilePicturePublicId());
        }
        Map result = cloudinaryService.uploadImage(file, "profile-pictures");
        profile.setProfilePictureUrl((String) result.get("secure_url"));
        profile.setProfilePicturePublicId((String) result.get("public_id"));
        return UserProfileResponse.fromEntity(userProfileRepository.save(profile));
    }

    public UserProfileResponse uploadResume(String userId, MultipartFile file) throws IOException {
        UserProfile profile = findProfileById(userId);
        if (profile.getResumePublicId() != null) {
            cloudinaryService.deleteFile(profile.getResumePublicId());
        }
        Map result = cloudinaryService.uploadFile(file, "resumes");
        profile.setResumeUrl((String) result.get("secure_url"));
        profile.setResumePublicId((String) result.get("public_id"));
        return UserProfileResponse.fromEntity(userProfileRepository.save(profile));
    }

    // ← NEW METHOD
    public List<UserProfileResponse> searchUsers(String keyword) {
        return userProfileRepository.searchByKeyword(keyword.toLowerCase())
                .stream()
                .map(UserProfileResponse::fromEntity)
                .collect(Collectors.toList());
    }

    private UserProfile findProfileById(String userId) {
        return userProfileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User profile not found: " + userId));
    }
}