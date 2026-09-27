package com.connectsphere.post.dto;

import com.connectsphere.post.entity.Post;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class PostResponse {
    private String id;
    private String authorId;
    private String authorName;
    private String content;
    private String imageUrl;
    private String type;
    private int likeCount;
    private int commentCount;
    private boolean likedByMe;
    private LocalDateTime createdAt;

    // ── Reaction fields ──────────────────────────────────
    private String myReaction;              // null if user hasn't reacted
    private int totalReactions;             // total across all reaction types
    private Map<String, Long> reactionCounts; // {"LIKE": 5, "CELEBRATE": 2, ...}
    private List<String> hashtags;

    // ── Basic fromEntity (no reaction data — used internally) ──
    public static PostResponse fromEntity(Post post, boolean likedByMe) {
        return PostResponse.builder()
                .id(post.getId())
                .authorId(post.getAuthorId())
                .authorName(post.getAuthorName())
                .content(post.getContent())
                .imageUrl(post.getImageUrl())
                .type(post.getType().name())
                .likeCount(post.getLikeCount())
                .commentCount(post.getCommentCount())
                .likedByMe(likedByMe)
                .createdAt(post.getCreatedAt())
                .myReaction(null)
                .totalReactions(post.getLikeCount())
                .reactionCounts(Collections.emptyMap())
                .hashtags(post.getHashtags() != null ? post.getHashtags() : Collections.emptyList())
                .build();
    }

    // ── Full fromEntity with reaction data ────────────────
    public static PostResponse fromEntity(Post post, boolean likedByMe,
                                          String myReaction,
                                          int totalReactions,
                                          Map<String, Long> reactionCounts) {
        return PostResponse.builder()
                .id(post.getId())
                .authorId(post.getAuthorId())
                .authorName(post.getAuthorName())
                .content(post.getContent())
                .imageUrl(post.getImageUrl())
                .type(post.getType().name())
                .likeCount(post.getLikeCount())
                .commentCount(post.getCommentCount())
                .likedByMe(likedByMe)
                .createdAt(post.getCreatedAt())
                .myReaction(myReaction)
                .totalReactions(totalReactions)
                .reactionCounts(reactionCounts != null ? reactionCounts : Collections.emptyMap())
                .hashtags(post.getHashtags() != null ? post.getHashtags() : Collections.emptyList())
                .build();
    }
}