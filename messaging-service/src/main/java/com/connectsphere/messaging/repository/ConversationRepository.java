package com.connectsphere.messaging.repository;

import com.connectsphere.messaging.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, String> {

    @Query("SELECT c FROM Conversation c WHERE c.participantOne = :userId OR c.participantTwo = :userId ORDER BY c.lastMessageAt DESC")
    List<Conversation> findAllByUserId(String userId);

    @Query("SELECT c FROM Conversation c WHERE (c.participantOne = :userA AND c.participantTwo = :userB) OR (c.participantOne = :userB AND c.participantTwo = :userA)")
    Optional<Conversation> findByParticipants(String userA, String userB);
}