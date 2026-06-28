package com.connectsphere.post.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PostEvent {
    private String eventType;   // POST_CREATED, POST_LIKED, POST_COMMENTED
    private String postId;
    private String authorId;    // post author
    private String actorId;     // who triggered the event
    private String actorName;
    private String content;     // post content preview
}