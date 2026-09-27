package com.connectsphere.post.util;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public class HashtagExtractor {

    private static final Pattern HASHTAG_PATTERN =
            Pattern.compile("#(\\w+)");

    public static List<String> extract(String content) {
        if (content == null || content.isBlank()) return List.of();
        Matcher matcher = HASHTAG_PATTERN.matcher(content);
        return matcher.results()
                .map(m -> m.group(1).toLowerCase())
                .distinct()
                .collect(Collectors.toList());
    }
}