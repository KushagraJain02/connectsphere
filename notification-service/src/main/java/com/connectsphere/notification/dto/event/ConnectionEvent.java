package com.connectsphere.notification.dto.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConnectionEvent {
    private String eventType;
    private String senderId;
    private String senderName;
    private String receiverId;
    private String receiverName;
}