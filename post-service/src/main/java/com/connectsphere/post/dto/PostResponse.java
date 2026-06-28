package com.connectsphere.post.dto;

import com.connectsphere.post.entity.Post;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

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
                .build();
    }
}