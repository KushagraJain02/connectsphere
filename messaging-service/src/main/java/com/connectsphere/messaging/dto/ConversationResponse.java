package com.connectsphere.messaging.dto;

import com.connectsphere.messaging.entity.Conversation;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ConversationResponse {
    private String id;
    private String participantOne;
    private String participantOneName;
    private String participantTwo;
    private String participantTwoName;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private int unreadCount;

    public static ConversationResponse fromEntity(Conversation c, String viewerId) {
        int unread = c.getParticipantOne().equals(viewerId)
                ? c.getUnreadCountOne() : c.getUnreadCountTwo();

        return ConversationResponse.builder()
                .id(c.getId())
                .participantOne(c.getParticipantOne())
                .participantOneName(c.getParticipantOneName())
                .participantTwo(c.getParticipantTwo())
                .participantTwoName(c.getParticipantTwoName())
                .lastMessage(c.getLastMessage())
                .lastMessageAt(c.getLastMessageAt())
                .unreadCount(unread)
                .build();
    }
}