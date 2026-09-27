package com.connectsphere.post.dto;

import com.connectsphere.post.entity.Reaction;
import lombok.Builder;
import lombok.Data;
import java.util.Map;

@Data
@Builder
public class ReactionResponse {
    private String myReaction;      // null if user hasn't reacted
    private int totalReactions;
    private Map<String, Long> counts; // {"LIKE": 5, "CELEBRATE": 2, ...}

    public static ReactionResponse from(
            Reaction.ReactionType myReaction,
            Map<String, Long> counts) {
        int total = counts.values().stream().mapToInt(Long::intValue).sum();
        return ReactionResponse.builder()
                .myReaction(myReaction != null ? myReaction.name() : null)
                .totalReactions(total)
                .counts(counts)
                .build();
    }
}