package com.connectsphere.connection.controller;

import com.connectsphere.connection.dto.ConnectionResponse;
import com.connectsphere.connection.service.ConnectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/connections")
@RequiredArgsConstructor
public class ConnectionController {

    private final ConnectionService connectionService;

    // Send connection request
    @PostMapping("/request/{receiverId}")
    public ResponseEntity<ConnectionResponse> sendRequest(
            @PathVariable String receiverId,
            @RequestHeader("X-User-Id") String senderId,
            @RequestHeader(value = "X-User-Name", required = false) String senderName,
            @RequestParam(required = false) String receiverName) {
        return ResponseEntity.ok(connectionService.sendRequest(
                senderId, senderName, receiverId, receiverName));
    }

    // Accept connection request
    @PutMapping("/{connectionId}/accept")
    public ResponseEntity<ConnectionResponse> acceptRequest(
            @PathVariable String connectionId,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(connectionService.acceptRequest(connectionId, userId));
    }

    // Reject connection request
    @PutMapping("/{connectionId}/reject")
    public ResponseEntity<ConnectionResponse> rejectRequest(
            @PathVariable String connectionId,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(connectionService.rejectRequest(connectionId, userId));
    }

    // Remove connection
    @DeleteMapping("/{connectionId}")
    public ResponseEntity<String> removeConnection(
            @PathVariable String connectionId,
            @RequestHeader("X-User-Id") String userId) {
        connectionService.removeConnection(connectionId, userId);
        return ResponseEntity.ok("Connection removed");
    }

    // Get my connections
    @GetMapping("/my")
    public ResponseEntity<List<ConnectionResponse>> getMyConnections(
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(connectionService.getMyConnections(userId));
    }

    // Get pending requests received
    @GetMapping("/pending")
    public ResponseEntity<List<ConnectionResponse>> getPendingRequests(
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(connectionService.getPendingRequests(userId));
    }

    // Get sent requests
    @GetMapping("/sent")
    public ResponseEntity<List<ConnectionResponse>> getSentRequests(
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(connectionService.getSentRequests(userId));
    }

    // Check connection status with another user
    @GetMapping("/status/{targetUserId}")
    public ResponseEntity<String> getConnectionStatus(
            @PathVariable String targetUserId,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(connectionService.getConnectionStatus(userId, targetUserId));
    }

    // Get connection count
    @GetMapping("/count/{userId}")
    public ResponseEntity<Long> getConnectionCount(@PathVariable String userId) {
        return ResponseEntity.ok(connectionService.getConnectionCount(userId));
    }
}