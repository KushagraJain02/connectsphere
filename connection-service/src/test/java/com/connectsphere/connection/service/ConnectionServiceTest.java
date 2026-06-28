package com.connectsphere.connection.service;

import com.connectsphere.connection.dto.ConnectionResponse;
import com.connectsphere.connection.dto.event.ConnectionEvent;
import com.connectsphere.connection.entity.Connection;
import com.connectsphere.connection.repository.ConnectionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Connection Service Tests")
class ConnectionServiceTest {

    @Mock private ConnectionRepository connectionRepository;
    @Mock private KafkaTemplate<String, ConnectionEvent> kafkaTemplate;

    @InjectMocks private ConnectionService connectionService;

    private static final String SENDER_ID = "sender-123";
    private static final String RECEIVER_ID = "receiver-456";
    private static final String CONNECTION_ID = "conn-789";

    private Connection mockConnection;

    @BeforeEach
    void setUp() {
        mockConnection = Connection.builder()
                .id(CONNECTION_ID)
                .senderId(SENDER_ID)
                .senderName("Rahul Sharma")
                .receiverId(RECEIVER_ID)
                .receiverName("Priya Patel")
                .status(Connection.Status.PENDING)
                .build();
    }

    @Test
    @DisplayName("Send request — success")
    void sendRequest_Success() {
        when(connectionRepository.findConnectionBetween(SENDER_ID, RECEIVER_ID))
                .thenReturn(Optional.empty());
        when(connectionRepository.save(any())).thenReturn(mockConnection);

        ConnectionResponse response = connectionService.sendRequest(
                SENDER_ID, "Rahul Sharma", RECEIVER_ID, "Priya Patel");

        assertThat(response.getStatus()).isEqualTo("PENDING");
        assertThat(response.getSenderId()).isEqualTo(SENDER_ID);
        verify(kafkaTemplate).send(eq("connection-events"), any(ConnectionEvent.class));
    }

    @Test
    @DisplayName("Send request — fails when connecting to yourself")
    void sendRequest_ToSelf_ThrowsException() {
        assertThatThrownBy(() ->
                connectionService.sendRequest(SENDER_ID, "Rahul", SENDER_ID, "Rahul"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Cannot connect with yourself");
    }

    @Test
    @DisplayName("Send request — fails when connection already exists")
    void sendRequest_AlreadyExists_ThrowsException() {
        when(connectionRepository.findConnectionBetween(SENDER_ID, RECEIVER_ID))
                .thenReturn(Optional.of(mockConnection));

        assertThatThrownBy(() ->
                connectionService.sendRequest(SENDER_ID, "Rahul", RECEIVER_ID, "Priya"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Connection already exists");
    }

    @Test
    @DisplayName("Accept request — success")
    void acceptRequest_Success() {
        when(connectionRepository.findById(CONNECTION_ID))
                .thenReturn(Optional.of(mockConnection));
        when(connectionRepository.save(any())).thenReturn(mockConnection);

        ConnectionResponse response = connectionService.acceptRequest(
                CONNECTION_ID, RECEIVER_ID);

        assertThat(mockConnection.getStatus()).isEqualTo(Connection.Status.ACCEPTED);
        verify(kafkaTemplate).send(eq("connection-events"), any(ConnectionEvent.class));
    }

    @Test
    @DisplayName("Accept request — fails when not the receiver")
    void acceptRequest_NotReceiver_ThrowsException() {
        when(connectionRepository.findById(CONNECTION_ID))
                .thenReturn(Optional.of(mockConnection));

        assertThatThrownBy(() ->
                connectionService.acceptRequest(CONNECTION_ID, SENDER_ID))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("only accept requests sent to you");
    }

    @Test
    @DisplayName("Reject request — success")
    void rejectRequest_Success() {
        when(connectionRepository.findById(CONNECTION_ID))
                .thenReturn(Optional.of(mockConnection));
        when(connectionRepository.save(any())).thenReturn(mockConnection);

        connectionService.rejectRequest(CONNECTION_ID, RECEIVER_ID);

        assertThat(mockConnection.getStatus()).isEqualTo(Connection.Status.REJECTED);
    }

    @Test
    @DisplayName("Get connection status — returns ACCEPTED")
    void getConnectionStatus_ReturnsAccepted() {
        mockConnection.setStatus(Connection.Status.ACCEPTED);
        when(connectionRepository.findConnectionBetween(SENDER_ID, RECEIVER_ID))
                .thenReturn(Optional.of(mockConnection));

        String status = connectionService.getConnectionStatus(SENDER_ID, RECEIVER_ID);

        assertThat(status).isEqualTo("ACCEPTED");
    }

    @Test
    @DisplayName("Get connection status — returns NOT_CONNECTED when no connection")
    void getConnectionStatus_ReturnsNotConnected() {
        when(connectionRepository.findConnectionBetween(SENDER_ID, RECEIVER_ID))
                .thenReturn(Optional.empty());

        String status = connectionService.getConnectionStatus(SENDER_ID, RECEIVER_ID);

        assertThat(status).isEqualTo("NOT_CONNECTED");
    }

    @Test
    @DisplayName("Get my connections — returns accepted connections")
    void getMyConnections_ReturnsAccepted() {
        when(connectionRepository.findAllAcceptedConnections(SENDER_ID))
                .thenReturn(List.of(mockConnection));

        List<ConnectionResponse> result = connectionService.getMyConnections(SENDER_ID);

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("Remove connection — success when part of connection")
    void removeConnection_Success() {
        when(connectionRepository.findById(CONNECTION_ID))
                .thenReturn(Optional.of(mockConnection));

        connectionService.removeConnection(CONNECTION_ID, SENDER_ID);

        verify(connectionRepository).delete(mockConnection);
    }

    @Test
    @DisplayName("Remove connection — fails when not part of connection")
    void removeConnection_NotPartOfConnection_ThrowsException() {
        when(connectionRepository.findById(CONNECTION_ID))
                .thenReturn(Optional.of(mockConnection));

        assertThatThrownBy(() ->
                connectionService.removeConnection(CONNECTION_ID, "stranger-id"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not part of this connection");
    }
}