package com.connectsphere.post.service;

import com.connectsphere.post.dto.ReactionResponse;
import com.connectsphere.post.entity.Reaction;
import com.connectsphere.post.entity.Post;
import com.connectsphere.post.repository.PostRepository;
import com.connectsphere.post.repository.ReactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReactionService {

    private final ReactionRepository reactionRepository;
    private final PostRepository postRepository;

    @Transactional
    public ReactionResponse toggleReaction(
            String postId,
            String userId,
            String userName,
            String reactionType) {

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Reaction.ReactionType type = Reaction.ReactionType.valueOf(reactionType);
        Optional<Reaction> existing = reactionRepository
                .findByPostIdAndUserId(postId, userId);

        if (existing.isPresent()) {
            if (existing.get().getType() == type) {
                // Same reaction — remove it (toggle off)
                reactionRepository.delete(existing.get());
                postRepository.decrementLikeCount(postId);
            } else {
                // Different reaction — update it
                existing.get().setType(type);
                reactionRepository.save(existing.get());
            }
        } else {
            // New reaction
            reactionRepository.save(Reaction.builder()
                    .postId(postId)
                    .userId(userId)
                    .userName(userName)
                    .type(type)
                    .build());
            postRepository.incrementLikeCount(postId);
        }

        return getReactions(postId, userId);
    }

    public ReactionResponse getReactions(String postId, String userId) {
        List<Object[]> counts = reactionRepository.countByTypeForPost(postId);
        Map<String, Long> countMap = new HashMap<>();
        for (Object[] row : counts) {
            countMap.put(row[0].toString(), (Long) row[1]);
        }

        Reaction.ReactionType myReaction = reactionRepository
                .findByPostIdAndUserId(postId, userId)
                .map(Reaction::getType)
                .orElse(null);

        return ReactionResponse.from(myReaction, countMap);
    }
}