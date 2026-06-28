package com.connectsphere.connection.service;

import com.connectsphere.connection.dto.ConnectionResponse;
import com.connectsphere.connection.dto.event.ConnectionEvent;
import com.connectsphere.connection.entity.Connection;
import com.connectsphere.connection.repository.ConnectionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConnectionService {

    private final ConnectionRepository connectionRepository;
    private final KafkaTemplate<String, ConnectionEvent> kafkaTemplate;

    public ConnectionResponse sendRequest(String senderId, String senderName,
                                          String receiverId, String receiverName) {
        if (senderId.equals(receiverId)) {
            throw new RuntimeException("Cannot connect with yourself");
        }

        connectionRepository.findConnectionBetween(senderId, receiverId)
                .ifPresent(c -> {
                    throw new RuntimeException("Connection already exists with status: " + c.getStatus());
                });

        Connection connection = Connection.builder()
                .senderId(senderId)
                .senderName(senderName)
                .receiverId(receiverId)
                .receiverName(receiverName)
                .status(Connection.Status.PENDING)
                .build();

        Connection saved = connectionRepository.save(connection);

        kafkaTemplate.send("connection-events", ConnectionEvent.builder()
                .eventType("CONNECTION_REQUESTED")
                .senderId(senderId)
                .senderName(senderName)
                .receiverId(receiverId)
                .receiverName(receiverName)
                .build());

        return ConnectionResponse.fromEntity(saved);
    }

    public ConnectionResponse acceptRequest(String connectionId, String userId) {
        Connection connection = findConnectionById(connectionId);

        if (!connection.getReceiverId().equals(userId)) {
            throw new RuntimeException("You can only accept requests sent to you");
        }

        if (connection.getStatus() != Connection.Status.PENDING) {
            throw new RuntimeException("Request is not pending");
        }

        connection.setStatus(Connection.Status.ACCEPTED);
        Connection saved = connectionRepository.save(connection);

        kafkaTemplate.send("connection-events", ConnectionEvent.builder()
                .eventType("CONNECTION_ACCEPTED")
                .senderId(connection.getSenderId())
                .senderName(connection.getSenderName())
                .receiverId(connection.getReceiverId())
                .receiverName(connection.getReceiverName())
                .build());

        return ConnectionResponse.fromEntity(saved);
    }

    public ConnectionResponse rejectRequest(String connectionId, String userId) {
        Connection connection = findConnectionById(connectionId);

        if (!connection.getReceiverId().equals(userId)) {
            throw new RuntimeException("You can only reject requests sent to you");
        }

        connection.setStatus(Connection.Status.REJECTED);
        return ConnectionResponse.fromEntity(connectionRepository.save(connection));
    }

    public void removeConnection(String connectionId, String userId) {
        Connection connection = findConnectionById(connectionId);

        if (!connection.getSenderId().equals(userId) &&
                !connection.getReceiverId().equals(userId)) {
            throw new RuntimeException("You are not part of this connection");
        }

        connectionRepository.delete(connection);
    }

    public List<ConnectionResponse> getMyConnections(String userId) {
        return connectionRepository.findAllAcceptedConnections(userId)
                .stream()
                .map(ConnectionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ConnectionResponse> getPendingRequests(String userId) {
        return connectionRepository.findByReceiverIdAndStatus(userId, Connection.Status.PENDING)
                .stream()
                .map(ConnectionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ConnectionResponse> getSentRequests(String userId) {
        return connectionRepository.findBySenderIdAndStatus(userId, Connection.Status.PENDING)
                .stream()
                .map(ConnectionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public String getConnectionStatus(String userId, String targetUserId) {
        return connectionRepository.findConnectionBetween(userId, targetUserId)
                .map(c -> c.getStatus().name())
                .orElse("NOT_CONNECTED");
    }

    public long getConnectionCount(String userId) {
        return connectionRepository.countConnections(userId);
    }

    private Connection findConnectionById(String connectionId) {
        return connectionRepository.findById(connectionId)
                .orElseThrow(() -> new RuntimeException("Connection not found: " + connectionId));
    }
}