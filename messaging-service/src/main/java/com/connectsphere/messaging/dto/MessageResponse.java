package com.connectsphere.messaging.dto;

import com.connectsphere.messaging.entity.Message;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class MessageResponse {
    private String id;
    private String conversationId;
    private String senderId;
    private String senderName;
    private String receiverId;
    private String content;
    private boolean seen;
    private LocalDateTime seenAt;
    private LocalDateTime createdAt;

    public static MessageResponse fromEntity(Message message) {
        return MessageResponse.builder()
                .id(message.getId())
                .conversationId(message.getConversationId())
                .senderId(message.getSenderId())
                .senderName(message.getSenderName())
                .receiverId(message.getReceiverId())
                .content(message.getContent())
                .seen(message.isSeen())
                .seenAt(message.getSeenAt())
                .createdAt(message.getCreatedAt())
                .build();
    }
}