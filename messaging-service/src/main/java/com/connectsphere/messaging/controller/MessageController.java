package com.connectsphere.messaging.controller;

import com.connectsphere.messaging.dto.*;
import com.connectsphere.messaging.service.MessagingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessagingService messagingService;

    // Send message via REST
    @PostMapping("/send")
    public ResponseEntity<MessageResponse> sendMessage(
            @RequestHeader("X-User-Id") String senderId,
            @RequestHeader(value = "X-User-Name", required = false) String senderName,
            @Valid @RequestBody SendMessageRequest request) {
        return ResponseEntity.ok(messagingService.sendMessage(senderId, senderName, request));
    }

    // Get messages in a conversation
    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<Page<MessageResponse>> getMessages(
            @PathVariable String conversationId,
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(messagingService.getMessages(conversationId, userId, page, size));
    }

    // Get all my conversations
    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationResponse>> getMyConversations(
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(messagingService.getMyConversations(userId));
    }

    // Mark message as seen
    @PutMapping("/{messageId}/seen")
    public ResponseEntity<MessageResponse> markAsSeen(
            @PathVariable String messageId,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(messagingService.markAsSeen(messageId, userId));
    }
}