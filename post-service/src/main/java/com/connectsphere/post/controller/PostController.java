package com.connectsphere.post.controller;

import com.connectsphere.post.dto.*;
import com.connectsphere.post.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping
    public ResponseEntity<PostResponse> createPost(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            @RequestParam("content") String content,
            @RequestParam(value = "type", defaultValue = "TEXT") String type,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestHeader(value = "X-User-Name", required = false) String userName) throws Exception {

        CreatePostRequest request = new CreatePostRequest();
        request.setContent(content);
        request.setType(type);

        String authorName = (userName != null && !userName.isBlank()) ? userName : userEmail;
        return ResponseEntity.ok(postService.createPost(userId, authorName, request, image));
    }

    @GetMapping("/feed")
    public ResponseEntity<Page<PostResponse>> getFeed(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(postService.getFeed(userId, page, size));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PostResponse>> getUserPosts(
            @PathVariable String userId,
            @RequestHeader("X-User-Id") String viewerId) {
        return ResponseEntity.ok(postService.getUserPosts(userId, viewerId));
    }

    @GetMapping("/{postId}")
    public ResponseEntity<PostResponse> getPost(
            @PathVariable String postId,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(postService.getPost(postId, userId));
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<String> toggleLike(
            @PathVariable String postId,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader(value = "X-User-Name", required = false) String userName,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail) {
        String actorName = (userName != null && !userName.isBlank()) ? userName : userEmail;
        return ResponseEntity.ok(postService.toggleLike(postId, userId, actorName));
    }

    @PostMapping("/{postId}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable String postId,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader(value = "X-User-Name", required = false) String userName,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            @Valid @RequestBody CommentRequest request) {
        String actorName = (userName != null && !userName.isBlank()) ? userName : userEmail;
        return ResponseEntity.ok(postService.addComment(postId, userId, actorName, request));
    }

    @GetMapping("/{postId}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable String postId) {
        return ResponseEntity.ok(postService.getComments(postId));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<String> deletePost(
            @PathVariable String postId,
            @RequestHeader("X-User-Id") String userId) throws Exception {
        postService.deletePost(postId, userId);
        return ResponseEntity.ok("Post deleted successfully");
    }
}