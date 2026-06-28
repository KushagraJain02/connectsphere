package com.connectsphere.messaging.service;

import com.connectsphere.messaging.dto.*;
import com.connectsphere.messaging.entity.*;
import com.connectsphere.messaging.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessagingService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public MessageResponse sendMessage(String senderId, String senderName,
                                       SendMessageRequest request) {
        // Get or create conversation
        Conversation conversation = conversationRepository
                .findByParticipants(senderId, request.getReceiverId())
                .orElseGet(() -> {
                    Conversation newConv = Conversation.builder()
                            .participantOne(senderId)
                            .participantOneName(senderName)
                            .participantTwo(request.getReceiverId())
                            .participantTwoName(request.getReceiverName())
                            .build();
                    return conversationRepository.save(newConv);
                });

        // Save message
        Message message = Message.builder()
                .conversationId(conversation.getId())
                .senderId(senderId)
                .senderName(senderName)
                .receiverId(request.getReceiverId())
                .content(request.getContent())
                .build();

        Message saved = messageRepository.save(message);

        // Update conversation
        conversation.setLastMessage(request.getContent());
        conversation.setLastMessageAt(LocalDateTime.now());

        if (conversation.getParticipantOne().equals(senderId)) {
            conversation.setUnreadCountTwo(conversation.getUnreadCountTwo() + 1);
        } else {
            conversation.setUnreadCountOne(conversation.getUnreadCountOne() + 1);
        }

        conversationRepository.save(conversation);

        MessageResponse response = MessageResponse.fromEntity(saved);

        // Push via WebSocket to receiver
        messagingTemplate.convertAndSendToUser(
                request.getReceiverId(),
                "/queue/messages",
                response
        );

        log.info("Message sent from {} to {}", senderId, request.getReceiverId());
        return response;
    }

    public Page<MessageResponse> getMessages(String conversationId,
                                             String userId, int page, int size) {
        // Mark messages as read
        messageRepository.markAllAsRead(conversationId, userId);

        // Reset unread count
        conversationRepository.findById(conversationId).ifPresent(conv -> {
            if (conv.getParticipantOne().equals(userId)) {
                conv.setUnreadCountOne(0);
            } else {
                conv.setUnreadCountTwo(0);
            }
            conversationRepository.save(conv);
        });

        return messageRepository
                .findByConversationIdOrderByCreatedAtDesc(
                        conversationId, PageRequest.of(page, size))
                .map(MessageResponse::fromEntity);
    }

    public List<ConversationResponse> getMyConversations(String userId) {
        return conversationRepository.findAllByUserId(userId)
                .stream()
                .map(c -> ConversationResponse.fromEntity(c, userId))
                .collect(Collectors.toList());
    }

    public MessageResponse markAsSeen(String messageId, String userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if (!message.getReceiverId().equals(userId)) {
            throw new RuntimeException("Not authorized");
        }

        message.setSeen(true);
        message.setSeenAt(LocalDateTime.now());

        // Notify sender via WebSocket
        messagingTemplate.convertAndSendToUser(
                message.getSenderId(),
                "/queue/seen",
                MessageResponse.fromEntity(message)
        );

        return MessageResponse.fromEntity(messageRepository.save(message));
    }
}