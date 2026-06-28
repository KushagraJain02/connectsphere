package com.connectsphere.notification.dto.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PostEvent {
    private String eventType;
    private String postId;
    private String authorId;
    private String actorId;
    private String actorName;
    private String content;
}