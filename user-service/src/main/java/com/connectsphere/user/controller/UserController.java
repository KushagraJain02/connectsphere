package com.connectsphere.user.controller;

import com.connectsphere.user.dto.UpdateProfileRequest;
import com.connectsphere.user.dto.UserProfileResponse;
import com.connectsphere.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/internal/create")
    public ResponseEntity<UserProfileResponse> createProfile(
            @RequestParam String userId,
            @RequestParam String fullName,
            @RequestParam String email) {
        return ResponseEntity.ok(userService.createProfile(userId, fullName, email));
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMyProfile(
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(userService.getMyProfile(userId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserProfileResponse>> searchUsers(
            @RequestParam String keyword) {
        return ResponseEntity.ok(userService.searchUsers(keyword));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserProfileResponse> getProfile(@PathVariable String userId) {
        return ResponseEntity.ok(userService.getProfile(userId));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(userId, request));
    }

    @PostMapping("/me/picture")
    public ResponseEntity<UserProfileResponse> uploadProfilePicture(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam("file") MultipartFile file) throws Exception {
        return ResponseEntity.ok(userService.uploadProfilePicture(userId, file));
    }

    @PostMapping("/me/resume")
    public ResponseEntity<UserProfileResponse> uploadResume(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam("file") MultipartFile file) throws Exception {
        return ResponseEntity.ok(userService.uploadResume(userId, file));
    }
}