package com.connectsphere.auth.controller;

import com.connectsphere.auth.dto.AuthResponse;
import com.connectsphere.auth.dto.LoginRequest;
import com.connectsphere.auth.dto.RegisterRequest;
import com.connectsphere.auth.security.CustomUserDetailsService;
import com.connectsphere.auth.security.JwtAuthFilter;
import com.connectsphere.auth.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        controllers = AuthController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = { JwtAuthFilter.class }
        )
)
@WithMockUser
@TestPropertySource(properties = {
        "jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970",
        "jwt.expiration=86400000",
        "eureka.client.enabled=false",
        "spring.cloud.discovery.enabled=false"
})
@DisplayName("Auth Controller Tests")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    private AuthResponse mockResponse() {
        return AuthResponse.builder()
                .token("mock-jwt-token")
                .userId("user-123")
                .email("rahul@test.com")
                .fullName("Rahul Sharma")
                .role("USER")
                .build();
    }

    @Test
    @DisplayName("POST /api/auth/register — returns 200 with token")
    void register_Returns200WithToken() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setFullName("Rahul Sharma");
        req.setEmail("rahul@test.com");
        req.setPassword("password123");
        req.setRole("USER");

        when(authService.register(any())).thenReturn(mockResponse());

        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock-jwt-token"))
                .andExpect(jsonPath("$.email").value("rahul@test.com"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    @DisplayName("POST /api/auth/register — returns 400 when email is blank")
    void register_Returns400WhenEmailBlank() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setFullName("Rahul Sharma");
        req.setEmail("");
        req.setPassword("password123");

        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/auth/register — returns 400 when password too short")
    void register_Returns400WhenPasswordTooShort() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setFullName("Rahul Sharma");
        req.setEmail("rahul@test.com");
        req.setPassword("short");

        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/auth/register — returns 400 when fullName is blank")
    void register_Returns400WhenFullNameBlank() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setFullName("");
        req.setEmail("rahul@test.com");
        req.setPassword("password123");

        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/auth/login — returns 200 with token")
    void login_Returns200WithToken() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("rahul@test.com");
        req.setPassword("password123");

        when(authService.login(any())).thenReturn(mockResponse());

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.email").value("rahul@test.com"))
                .andExpect(jsonPath("$.fullName").value("Rahul Sharma"));
    }

    @Test
    @DisplayName("POST /api/auth/login — returns 400 when email is blank")
    void login_Returns400WhenEmailBlank() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("");
        req.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/auth/health — returns 200")
    void health_Returns200() throws Exception {
        mockMvc.perform(get("/api/auth/health")
                        .with(csrf()))
                .andExpect(status().isOk());
    }
}