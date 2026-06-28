package com.connectsphere.messaging.repository;

import com.connectsphere.messaging.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, String> {

    Page<Message> findByConversationIdOrderByCreatedAtDesc(String conversationId, Pageable pageable);

    List<Message> findByConversationIdAndReceiverIdAndSeenFalse(String conversationId, String receiverId);

    @Modifying
    @Transactional
    @Query("UPDATE Message m SET m.seen = true, m.seenAt = CURRENT_TIMESTAMP WHERE m.conversationId = :conversationId AND m.receiverId = :userId AND m.seen = false")
    void markAllAsRead(String conversationId, String userId);
}