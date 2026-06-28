package com.connectsphere.post.service;

import com.connectsphere.post.dto.*;
import com.connectsphere.post.dto.event.PostEvent;
import com.connectsphere.post.entity.*;
import com.connectsphere.post.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final CloudinaryService cloudinaryService;
    private final KafkaTemplate<String, PostEvent> kafkaTemplate;

    public PostResponse createPost(String userId, String authorName,
                                   CreatePostRequest request,
                                   MultipartFile image) throws IOException {
        Post.PostType type = Post.PostType.TEXT;
        if (request.getType() != null) {
            type = Post.PostType.valueOf(request.getType().toUpperCase());
        }

        Post post = Post.builder()
                .authorId(userId)
                .authorName(authorName)
                .content(request.getContent())
                .type(type)
                .build();

        if (image != null && !image.isEmpty()) {
            Map result = cloudinaryService.uploadImage(image);
            post.setImageUrl((String) result.get("secure_url"));
            post.setImagePublicId((String) result.get("public_id"));
            post.setType(Post.PostType.IMAGE);
        }

        Post saved = postRepository.save(post);

        // Publish Kafka event
        kafkaTemplate.send("post-events", PostEvent.builder()
                .eventType("POST_CREATED")
                .postId(saved.getId())
                .authorId(userId)
                .actorId(userId)
                .actorName(authorName)
                .content(request.getContent().substring(0,
                        Math.min(request.getContent().length(), 100)))
                .build());

        return PostResponse.fromEntity(saved, false);
    }

    public Page<PostResponse> getFeed(String userId, int page, int size) {
        return postRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size))
                .map(post -> PostResponse.fromEntity(post,
                        likeRepository.existsByPostIdAndUserId(post.getId(), userId)));
    }

    public List<PostResponse> getUserPosts(String userId, String viewerId) {
        return postRepository.findByAuthorIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(post -> PostResponse.fromEntity(post,
                        likeRepository.existsByPostIdAndUserId(post.getId(), viewerId)))
                .collect(Collectors.toList());
    }

    public PostResponse getPost(String postId, String userId) {
        Post post = findPostById(postId);
        return PostResponse.fromEntity(post,
                likeRepository.existsByPostIdAndUserId(postId, userId));
    }

    public String toggleLike(String postId, String userId, String userName) {
        Post post = findPostById(postId);

        if (likeRepository.existsByPostIdAndUserId(postId, userId)) {
            Like like = likeRepository.findByPostIdAndUserId(postId, userId).get();
            likeRepository.delete(like);
            postRepository.decrementLikeCount(postId);
            return "unliked";
        } else {
            likeRepository.save(Like.builder()
                    .postId(postId)
                    .userId(userId)
                    .build());
            postRepository.incrementLikeCount(postId);

            // Notify post author
            kafkaTemplate.send("post-events", PostEvent.builder()
                    .eventType("POST_LIKED")
                    .postId(postId)
                    .authorId(post.getAuthorId())
                    .actorId(userId)
                    .actorName(userName)
                    .build());

            return "liked";
        }
    }

    public CommentResponse addComment(String postId, String userId,
                                      String authorName, CommentRequest request) {
        findPostById(postId);

        Comment comment = Comment.builder()
                .postId(postId)
                .authorId(userId)
                .authorName(authorName)
                .content(request.getContent())
                .build();

        commentRepository.save(comment);
        postRepository.incrementCommentCount(postId);

        Post post = findPostById(postId);

        // Notify post author
        kafkaTemplate.send("post-events", PostEvent.builder()
                .eventType("POST_COMMENTED")
                .postId(postId)
                .authorId(post.getAuthorId())
                .actorId(userId)
                .actorName(authorName)
                .content(request.getContent())
                .build());

        return CommentResponse.fromEntity(comment);
    }

    public List<CommentResponse> getComments(String postId) {
        return commentRepository.findByPostIdOrderByCreatedAtDesc(postId)
                .stream()
                .map(CommentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public void deletePost(String postId, String userId) throws IOException {
        Post post = findPostById(postId);

        if (!post.getAuthorId().equals(userId)) {
            throw new RuntimeException("You can only delete your own posts");
        }

        if (post.getImagePublicId() != null) {
            cloudinaryService.deleteImage(post.getImagePublicId());
        }

        postRepository.delete(post);
    }

    private Post findPostById(String postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found: " + postId));
    }
}