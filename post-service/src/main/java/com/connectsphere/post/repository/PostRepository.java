package com.connectsphere.post.repository;

import com.connectsphere.post.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, String> {
    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<Post> findByAuthorIdOrderByCreatedAtDesc(String authorId);

    @Modifying
    @Transactional
    @Query("UPDATE Post p SET p.likeCount = p.likeCount + 1 WHERE p.id = :postId")
    void incrementLikeCount(String postId);

    @Modifying
    @Transactional
    @Query("UPDATE Post p SET p.likeCount = p.likeCount - 1 WHERE p.id = :postId")
    void decrementLikeCount(String postId);

    @Modifying
    @Transactional
    @Query("UPDATE Post p SET p.commentCount = p.commentCount + 1 WHERE p.id = :postId")
    void incrementCommentCount(String postId);

    // Add to PostRepository.java
    @Query("SELECT DISTINCT p FROM Post p JOIN p.hashtags h " +
            "WHERE LOWER(h) = LOWER(:hashtag) " +
            "ORDER BY p.createdAt DESC")
    Page<Post> findByHashtag(String hashtag, Pageable pageable);


    @Query("SELECT h, COUNT(h) as cnt FROM Post p JOIN p.hashtags h " +
            "WHERE p.createdAt >= :since " +
            "GROUP BY h ORDER BY cnt DESC")
    List<String> findTrendingHashtags(LocalDateTime since, Pageable pageable);
}