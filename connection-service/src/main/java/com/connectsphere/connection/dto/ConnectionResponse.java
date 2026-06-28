package com.connectsphere.connection.dto;

import com.connectsphere.connection.entity.Connection;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ConnectionResponse {
    private String id;
    private String senderId;
    private String senderName;
    private String receiverId;
    private String receiverName;
    private String status;
    private LocalDateTime createdAt;

    public static ConnectionResponse fromEntity(Connection connection) {
        return ConnectionResponse.builder()
                .id(connection.getId())
                .senderId(connection.getSenderId())
                .senderName(connection.getSenderName())
                .receiverId(connection.getReceiverId())
                .receiverName(connection.getReceiverName())
                .status(connection.getStatus().name())
                .createdAt(connection.getCreatedAt())
                .build();
    }
}