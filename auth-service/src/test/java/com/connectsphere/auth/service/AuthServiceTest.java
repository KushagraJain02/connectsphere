package com.connectsphere.auth.service;

import com.connectsphere.auth.dto.AuthResponse;
import com.connectsphere.auth.dto.LoginRequest;
import com.connectsphere.auth.dto.RegisterRequest;
import com.connectsphere.auth.entity.User;
import com.connectsphere.auth.repository.UserRepository;
import com.connectsphere.auth.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Auth Service Tests")
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User mockUser;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setFullName("Rahul Sharma");
        registerRequest.setEmail("rahul@test.com");
        registerRequest.setPassword("password123");
        registerRequest.setRole("USER");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("rahul@test.com");
        loginRequest.setPassword("password123");

        mockUser = User.builder()
                .id("user-123")
                .fullName("Rahul Sharma")
                .email("rahul@test.com")
                .password("encoded-password")
                .role(User.Role.USER)
                .build();
    }

    // ── Register Tests ─────────────────────────────────────

    @Test
    @DisplayName("Register — success with valid data")
    void register_Success() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenReturn(mockUser);
        when(jwtService.generateToken(any(), any(), any(), any())).thenReturn("jwt-token");

        AuthResponse response = authService.register(registerRequest);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getEmail()).isEqualTo("rahul@test.com");
        assertThat(response.getFullName()).isEqualTo("Rahul Sharma");
        assertThat(response.getRole()).isEqualTo("USER");

        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Register — fails when email already exists")
    void register_EmailAlreadyExists_ThrowsException() {
        when(userRepository.existsByEmail("rahul@test.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Email already registered");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Register — password is encoded before saving")
    void register_PasswordIsEncoded() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("bcrypt-hash");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            assertThat(user.getPassword()).isEqualTo("bcrypt-hash");
            assertThat(user.getPassword()).isNotEqualTo("password123");
            return mockUser;
        });
        when(jwtService.generateToken(any(), any(), any(), any())).thenReturn("token");

        authService.register(registerRequest);

        verify(passwordEncoder).encode("password123");
    }

    @Test
    @DisplayName("Register — RECRUITER role is set correctly")
    void register_RecruiterRole() {
        registerRequest.setRole("RECRUITER");
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            assertThat(user.getRole()).isEqualTo(User.Role.RECRUITER);
            return mockUser;
        });
        when(jwtService.generateToken(any(), any(), any(), any())).thenReturn("token");

        authService.register(registerRequest);
    }

    @Test
    @DisplayName("Register — defaults to USER role when role is null")
    void register_DefaultsToUserRole() {
        registerRequest.setRole(null);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            assertThat(user.getRole()).isEqualTo(User.Role.USER);
            return mockUser;
        });
        when(jwtService.generateToken(any(), any(), any(), any())).thenReturn("token");

        authService.register(registerRequest);
    }

    // ── Login Tests ────────────────────────────────────────

    @Test
    @DisplayName("Login — success with correct credentials")
    void login_Success() {
        when(authenticationManager.authenticate(any())).thenReturn(
                new UsernamePasswordAuthenticationToken("rahul@test.com", "password123")
        );
        when(userRepository.findByEmail("rahul@test.com")).thenReturn(Optional.of(mockUser));
        when(jwtService.generateToken(any(), any(), any(), any())).thenReturn("jwt-token");

        AuthResponse response = authService.login(loginRequest);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getEmail()).isEqualTo("rahul@test.com");
    }

    @Test
    @DisplayName("Login — fails with wrong password")
    void login_WrongPassword_ThrowsException() {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    @DisplayName("Login — fails when user not found")
    void login_UserNotFound_ThrowsException() {
        when(authenticationManager.authenticate(any())).thenReturn(
                new UsernamePasswordAuthenticationToken("rahul@test.com", "password123")
        );
        when(userRepository.findByEmail("rahul@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found");
    }
}