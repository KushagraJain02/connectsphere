package com.connectsphere.post.service;

import com.connectsphere.post.dto.*;
import com.connectsphere.post.dto.event.PostEvent;
import com.connectsphere.post.entity.*;
import com.connectsphere.post.repository.*;
import com.connectsphere.post.util.HashtagExtractor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final ReactionRepository reactionRepository;
    private final CloudinaryService cloudinaryService;
    private final KafkaTemplate<String, PostEvent> kafkaTemplate;

    // ── Create Post ───────────────────────────────────────

    public PostResponse createPost(String userId, String authorName,
                                   CreatePostRequest request,
                                   MultipartFile image) throws IOException {
        Post.PostType type = Post.PostType.TEXT;
        if (request.getType() != null) {
            type = Post.PostType.valueOf(request.getType().toUpperCase());
        }

        List<String> hashtags = HashtagExtractor.extract(request.getContent());

        Post post = Post.builder()
                .authorId(userId)
                .authorName(authorName)
                .content(request.getContent())
                .type(type)
                .hashtags(hashtags)
                .build();

        if (image != null && !image.isEmpty()) {
            Map result = cloudinaryService.uploadImage(image);
            post.setImageUrl((String) result.get("secure_url"));
            post.setImagePublicId((String) result.get("public_id"));
            post.setType(Post.PostType.IMAGE);
        }

        Post saved = postRepository.save(post);

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

    // ── Feed ─────────────────────────────────────────────

    public Page<PostResponse> getFeed(String userId, int page, int size) {
        return postRepository
                .findAllByOrderByCreatedAtDesc(PageRequest.of(page, size))
                .map(post -> buildPostResponse(post, userId));
    }

    // ── User Posts ────────────────────────────────────────

    public List<PostResponse> getUserPosts(String userId, String viewerId) {
        return postRepository.findByAuthorIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(post -> buildPostResponse(post, viewerId))
                .collect(Collectors.toList());
    }

    // ── Single Post ───────────────────────────────────────

    public PostResponse getPost(String postId, String userId) {
        Post post = findPostById(postId);
        return buildPostResponse(post, userId);
    }

    // ── Reactions ─────────────────────────────────────────

    @Transactional
    public ReactionResponse toggleReaction(String postId, String userId,
                                           String userName, String reactionType) {
        findPostById(postId); // validate exists

        Reaction.ReactionType type = Reaction.ReactionType.valueOf(reactionType);
        Optional<Reaction> existing = reactionRepository
                .findByPostIdAndUserId(postId, userId);

        if (existing.isPresent()) {
            if (existing.get().getType() == type) {
                // Same reaction → toggle off
                reactionRepository.delete(existing.get());
                postRepository.decrementLikeCount(postId);
            } else {
                // Different reaction → update
                existing.get().setType(type);
                reactionRepository.save(existing.get());

                // Publish Kafka event for the new reaction type
                publishReactionEvent(postId, userId, userName, type);
            }
        } else {
            // New reaction
            reactionRepository.save(Reaction.builder()
                    .postId(postId)
                    .userId(userId)
                    .userName(userName)
                    .type(type)
                    .build());
            postRepository.incrementLikeCount(postId);
            publishReactionEvent(postId, userId, userName, type);
        }

        return buildReactionResponse(postId, userId);
    }

    public ReactionResponse getReactions(String postId, String userId) {
        return buildReactionResponse(postId, userId);
    }

    // ── Legacy Like (kept for backward compat) ────────────

    @Transactional
    public String toggleLike(String postId, String userId, String userName) {
        // Delegate to reaction system using LIKE type
        ReactionResponse response = toggleReaction(postId, userId, userName, "LIKE");
        return response.getMyReaction() != null ? "liked" : "unliked";
    }

    // ── Comments ──────────────────────────────────────────

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

    // ── Delete Post ───────────────────────────────────────

    public void deletePost(String postId, String userId) throws IOException {
        Post post = findPostById(postId);

        if (!post.getAuthorId().equals(userId)) {
            throw new RuntimeException("You can only delete your own posts");
        }

        if (post.getImagePublicId() != null) {
            cloudinaryService.deleteImage(post.getImagePublicId());
        }

        // Clean up reactions and likes for this post
        reactionRepository.deleteByPostId(postId);

        postRepository.delete(post);
    }

    // ── Private Helpers ───────────────────────────────────

    private PostResponse buildPostResponse(Post post, String userId) {
        boolean likedByMe = likeRepository
                .existsByPostIdAndUserId(post.getId(), userId);

        ReactionResponse reactions = buildReactionResponse(post.getId(), userId);

        return PostResponse.fromEntity(
                post,
                likedByMe,
                reactions.getMyReaction(),
                reactions.getTotalReactions(),
                reactions.getCounts()
        );
    }

    private ReactionResponse buildReactionResponse(String postId, String userId) {
        // Get all reaction counts grouped by type
        List<Object[]> rawCounts = reactionRepository
                .countByTypeForPost(postId);

        Map<String, Long> countMap = new LinkedHashMap<>();
        int total = 0;
        for (Object[] row : rawCounts) {
            String typeName = row[0].toString();
            Long count = (Long) row[1];
            countMap.put(typeName, count);
            total += count;
        }

        // Get this user's reaction
        String myReaction = reactionRepository
                .findByPostIdAndUserId(postId, userId)
                .map(r -> r.getType().name())
                .orElse(null);

        return ReactionResponse.builder()
                .myReaction(myReaction)
                .totalReactions(total)
                .counts(countMap)
                .build();
    }

    private void publishReactionEvent(String postId, String userId,
                                      String userName,
                                      Reaction.ReactionType type) {
        Post post = findPostById(postId);

        // Only notify if reacting to someone else's post
        if (!post.getAuthorId().equals(userId)) {
            kafkaTemplate.send("post-events", PostEvent.builder()
                    .eventType("POST_LIKED")
                    .postId(postId)
                    .authorId(post.getAuthorId())
                    .actorId(userId)
                    .actorName(userName)
                    .content(type.name())
                    .build());
        }
    }

    private Post findPostById(String postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found: " + postId));
    }


    public Page<PostResponse> getPostsByHashtag(String hashtag, String userId,
                                                int page, int size) {
        return postRepository
                .findByHashtag(hashtag, PageRequest.of(page, size))
                .map(post -> buildPostResponse(post, userId));
    }

    public List<String> getTrendingHashtags() {
        // Get top 10 hashtags from last 7 days
        return postRepository.findTrendingHashtags(
                LocalDateTime.now().minusDays(7),
                PageRequest.of(0, 10)
        );
    }
}