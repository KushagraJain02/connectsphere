package com.connectsphere.auth.integration;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

@Disabled("Integration test requires Docker — run manually with: ./mvnw test -Dtest=AuthIntegrationTest")
class AuthIntegrationTest {

    @Test
    void registerAndLogin_FullFlow() {
        // Disabled — requires Docker and running PostgreSQL
    }

    @Test
    void register_DuplicateEmail_Returns400() {
        // Disabled — requires Docker and running PostgreSQL
    }

    @Test
    void login_WrongPassword_Returns400() {
        // Disabled — requires Docker and running PostgreSQL
    }
}