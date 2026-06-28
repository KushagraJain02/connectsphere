package com.connectsphere.gateway.config;

import com.connectsphere.gateway.filter.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class GatewayConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public RouteLocator routes(RouteLocatorBuilder builder) {
        return builder.routes()

                // ── Auth Service — PUBLIC (no JWT) ──────────────────
                .route("auth-service", r -> r
                        .path("/api/auth/**")
                        .uri("lb://auth-service"))

                // ── User Service — Internal (no JWT) ────────────────
                .route("user-service-internal", r -> r
                        .path("/api/users/internal/**")
                        .uri("lb://user-service"))

                // ── User Service — Search (no JWT) ──────────────────
                .route("user-service-search", r -> r
                        .path("/api/users/search")
                        .uri("lb://user-service"))

                // ── User Service — Protected ─────────────────────────
                .route("user-service", r -> r
                        .path("/api/users/**")
                        .filters(f -> f.filter(jwtAuthFilter.apply(new JwtAuthFilter.Config())))
                        .uri("lb://user-service"))

                // ── Post Service — Protected ─────────────────────────
                .route("post-service", r -> r
                        .path("/api/posts/**")
                        .filters(f -> f.filter(jwtAuthFilter.apply(new JwtAuthFilter.Config())))
                        .uri("lb://post-service"))

                // ── Connection Service — Protected ───────────────────
                .route("connection-service", r -> r
                        .path("/api/connections/**")
                        .filters(f -> f.filter(jwtAuthFilter.apply(new JwtAuthFilter.Config())))
                        .uri("lb://connection-service"))

                // ── Messaging Service — Protected ────────────────────
                .route("messaging-service", r -> r
                        .path("/api/messages/**")
                        .filters(f -> f.filter(jwtAuthFilter.apply(new JwtAuthFilter.Config())))
                        .uri("lb://messaging-service"))

                // ── Job Service — Protected ──────────────────────────
                .route("job-service", r -> r
                        .path("/api/jobs/**")
                        .filters(f -> f.filter(jwtAuthFilter.apply(new JwtAuthFilter.Config())))
                        .uri("lb://job-service"))

                // ── Notification Service — Protected ─────────────────
                .route("notification-service", r -> r
                        .path("/api/notifications/**")
                        .filters(f -> f.filter(jwtAuthFilter.apply(new JwtAuthFilter.Config())))
                        .uri("lb://notification-service"))

                .build();
    }
}