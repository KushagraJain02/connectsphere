package com.connectsphere.connection.repository;

import com.connectsphere.connection.entity.Connection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ConnectionRepository extends JpaRepository<Connection, String> {

    Optional<Connection> findBySenderIdAndReceiverId(String senderId, String receiverId);

    // Get all accepted connections for a user
    @Query("SELECT c FROM Connection c WHERE (c.senderId = :userId OR c.receiverId = :userId) AND c.status = 'ACCEPTED'")
    List<Connection> findAllAcceptedConnections(String userId);

    // Get pending requests received by user
    List<Connection> findByReceiverIdAndStatus(String receiverId, Connection.Status status);

    // Get pending requests sent by user
    List<Connection> findBySenderIdAndStatus(String senderId, Connection.Status status);

    // Check if connection exists either way
    @Query("SELECT c FROM Connection c WHERE (c.senderId = :userId1 AND c.receiverId = :userId2) OR (c.senderId = :userId2 AND c.receiverId = :userId1)")
    Optional<Connection> findConnectionBetween(String userId1, String userId2);

    // Count accepted connections
    @Query("SELECT COUNT(c) FROM Connection c WHERE (c.senderId = :userId OR c.receiverId = :userId) AND c.status = 'ACCEPTED'")
    long countConnections(String userId);
}