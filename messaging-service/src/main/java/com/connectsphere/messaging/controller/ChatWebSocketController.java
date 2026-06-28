package com.connectsphere.messaging.controller;

import com.connectsphere.messaging.dto.MessageResponse;
import com.connectsphere.messaging.dto.SendMessageRequest;
import com.connectsphere.messaging.service.MessagingService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final MessagingService messagingService;

    @MessageMapping("/chat.send")
    public MessageResponse sendMessage(
            @Payload SendMessageRequest request,
            SimpMessageHeaderAccessor headerAccessor) {

        String senderId = (String) headerAccessor.getSessionAttributes().get("userId");
        String senderName = (String) headerAccessor.getSessionAttributes().get("userName");

        return messagingService.sendMessage(senderId, senderName, request);
    }
}