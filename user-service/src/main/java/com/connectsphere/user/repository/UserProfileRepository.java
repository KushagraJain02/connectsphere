package com.connectsphere.user.repository;

import com.connectsphere.user.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

public interface UserProfileRepository extends JpaRepository<UserProfile, String> {

    Optional<UserProfile> findByEmail(String email);

    @Modifying
    @Transactional
    @Query("UPDATE UserProfile u SET u.profileViews = u.profileViews + 1 WHERE u.userId = :userId")
    void incrementProfileViews(String userId);

    @Query("SELECT u FROM UserProfile u WHERE " +
            "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.headline) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.location) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<UserProfile> searchByKeyword(String keyword);
}