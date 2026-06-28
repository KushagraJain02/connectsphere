package com.connectsphere.connection.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ConnectionEvent {
    private String eventType;    // CONNECTION_REQUESTED, CONNECTION_ACCEPTED
    private String senderId;
    private String senderName;
    private String receiverId;
    private String receiverName;
}