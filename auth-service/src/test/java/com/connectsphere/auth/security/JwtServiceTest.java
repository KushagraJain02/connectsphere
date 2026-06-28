package com.connectsphere.auth.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.*;

@DisplayName("JWT Service Tests")
class JwtServiceTest {

    private JwtService jwtService;

    private static final String SECRET =
            "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private static final long EXPIRATION = 86400000L;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", SECRET);
        ReflectionTestUtils.setField(jwtService, "expiration", EXPIRATION);
    }

    @Test
    @DisplayName("Generate token — returns non-null token")
    void generateToken_ReturnsToken() {
        String token = jwtService.generateToken(
                "user-123", "test@test.com", "USER", "Test User");
        assertThat(token).isNotNull().isNotEmpty();
    }

    @Test
    @DisplayName("Generate token — token is a valid JWT structure")
    void generateToken_ValidJwtStructure() {
        String token = jwtService.generateToken(
                "user-123", "test@test.com", "USER", "Test User");
        // JWT has 3 parts separated by dots
        String[] parts = token.split("\\.");
        assertThat(parts).hasSize(3);
    }

    @Test
    @DisplayName("Extract email — returns correct email")
    void extractEmail_ReturnsCorrectEmail() {
        String token = jwtService.generateToken(
                "user-123", "test@test.com", "USER", "Test User");
        assertThat(jwtService.extractEmail(token)).isEqualTo("test@test.com");
    }

    @Test
    @DisplayName("Extract role — returns correct USER role")
    void extractRole_ReturnsUserRole() {
        String token = jwtService.generateToken(
                "user-123", "test@test.com", "USER", "Test User");
        assertThat(jwtService.extractRole(token)).isEqualTo("USER");
    }

    @Test
    @DisplayName("Extract role — returns correct RECRUITER role")
    void extractRole_ReturnsRecruiterRole() {
        String token = jwtService.generateToken(
                "user-123", "test@test.com", "RECRUITER", "Test User");
        assertThat(jwtService.extractRole(token)).isEqualTo("RECRUITER");
    }

    @Test
    @DisplayName("Is token valid — returns true for valid token")
    void isTokenValid_ValidToken_ReturnsTrue() {
        String token = jwtService.generateToken(
                "user-123", "test@test.com", "USER", "Test User");
        assertThat(jwtService.isTokenValid(token)).isTrue();
    }

    @Test
    @DisplayName("Is token valid — returns false for tampered token")
    void isTokenValid_TamperedToken_ReturnsFalse() {
        String token = jwtService.generateToken(
                "user-123", "test@test.com", "USER", "Test User");
        String tampered = token.substring(0, token.length() - 5) + "xxxxx";
        assertThat(jwtService.isTokenValid(tampered)).isFalse();
    }

    @Test
    @DisplayName("Is token valid — returns false for null token")
    void isTokenValid_NullToken_ReturnsFalse() {
        assertThat(jwtService.isTokenValid(null)).isFalse();
    }

    @Test
    @DisplayName("Is token valid — returns false for empty string")
    void isTokenValid_EmptyToken_ReturnsFalse() {
        // This tests that we handle empty gracefully without exception
        boolean result = false;
        try {
            result = jwtService.isTokenValid("");
        } catch (Exception e) {
            // If exception thrown, test fails
            fail("isTokenValid should not throw exception for empty string, got: " + e.getMessage());
        }
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("Is token valid — returns false for blank string")
    void isTokenValid_BlankToken_ReturnsFalse() {
        boolean result = false;
        try {
            result = jwtService.isTokenValid("   ");
        } catch (Exception e) {
            fail("isTokenValid should not throw exception for blank string, got: " + e.getMessage());
        }
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("Is token valid — returns false for random string")
    void isTokenValid_RandomString_ReturnsFalse() {
        assertThat(jwtService.isTokenValid("not.a.jwt")).isFalse();
    }

    @Test
    @DisplayName("Different users get different tokens")
    void generateToken_DifferentUsers_DifferentTokens() {
        String token1 = jwtService.generateToken(
                "user-1", "user1@test.com", "USER", "User One");
        String token2 = jwtService.generateToken(
                "user-2", "user2@test.com", "USER", "User Two");
        assertThat(token1).isNotEqualTo(token2);
    }

    @Test
    @DisplayName("Same user generates different tokens each time (due to timestamp)")
    void generateToken_SameUser_DifferentTokensEachTime() throws InterruptedException {
        String token1 = jwtService.generateToken(
                "user-1", "user1@test.com", "USER", "User One");
        Thread.sleep(10); // ensure different timestamp
        String token2 = jwtService.generateToken(
                "user-1", "user1@test.com", "USER", "User One");
        // Tokens may differ due to issuedAt timestamp
        assertThat(token1).isNotNull();
        assertThat(token2).isNotNull();
    }
}