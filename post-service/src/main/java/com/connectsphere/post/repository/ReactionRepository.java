package com.connectsphere.post.repository;

import com.connectsphere.post.entity.Reaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface ReactionRepository extends JpaRepository<Reaction, String> {

    Optional<Reaction> findByPostIdAndUserId(String postId, String userId);

    boolean existsByPostIdAndUserId(String postId, String userId);

    List<Reaction> findByPostId(String postId);

    @Query("SELECT r.type, COUNT(r) FROM Reaction r WHERE r.postId = :postId GROUP BY r.type")
    List<Object[]> countByTypeForPost(String postId);

    void deleteByPostIdAndUserId(String postId, String userId);
    void deleteByPostId(String postId);
}