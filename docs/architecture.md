# Architecture

This document describes the system design of ConnectSphere in detail — the services, their responsibilities, how they communicate, and the reasoning behind key decisions.

---

## 1. Service Inventory

| Service | Port | Database | Responsibility |
|---|---|---|---|
| eureka-server | 8761 | — | Service discovery/registry |
| config-server | 8888 | — | Centralized configuration for all services |
| api-gateway | 8080 | — | Single entry point, JWT validation, request routing |
| auth-service | 8081 | auth_db | Registration, login, JWT issuance/validation |
| user-service | 8082 | user_db | Profiles, skills, experience, media uploads |
| post-service | 8083 | post_db | Posts, likes, comments, feed |
| connection-service | 8084 | connection_db | Connection requests, network graph |
| messaging-service | 8085 | messaging_db | Real-time chat (WebSocket) |
| notification-service | 8086 | notification_db | In-app + email notifications |
| job-service | 8087 | job_db | Job postings, applications |

Each service owns its own PostgreSQL database — no shared schemas, no cross-service joins. This is a deliberate microservices boundary: services communicate only via HTTP (through the gateway) or asynchronously via Kafka events, never by reaching into another service's database.

---

## 2. Request Flow

### Synchronous (HTTP)

```
Client → API Gateway → JwtAuthFilter (validates token, injects X-User-Id/Email/Role headers)
                     → routes to target service (via Eureka service discovery)
                     → service processes request → returns response
```

The gateway is the only service exposed publicly. All internal services are only reachable within the cluster network — they trust the `X-User-Id` header set by the gateway's filter rather than re-validating JWTs themselves (except internal-only endpoints like user creation, which bypass auth entirely and are called service-to-service).

### Asynchronous (Kafka events)

Certain actions trigger events that other services react to independently:

| Event Topic | Producer | Consumer(s) | Purpose |
|---|---|---|---|
| `post-events` | post-service | notification-service | Notify on new post, like, comment |
| `connection-events` | connection-service | notification-service | Notify on connection request/accept |
| `job-events` | job-service | notification-service | Notify on new application, status change |

This decouples notification delivery from the core business logic — if notification-service is temporarily down, posts/connections/applications still succeed; notifications simply catch up once the consumer reconnects (Kafka retains the offset).

---

## 3. Why These Technology Choices

**Eureka (Service Discovery)**
Services register themselves on startup and discover each other by logical name (`lb://auth-service`) rather than hardcoded IPs. This lets the API Gateway and any service load-balance across multiple replicas of a downstream service without static configuration.

**Spring Cloud Config Server**
All shared configuration (Eureka URL, Jackson date settings, actuator exposure) lives in one place (`config-server/src/main/resources/configs/`). Changing a cross-cutting setting doesn't require editing 10 different `application.yml` files.

**Kafka over direct HTTP calls for side-effects**
Sending a notification is not part of the "critical path" of creating a post — it's a side effect. Making it synchronous (post-service calling notification-service directly) would mean post creation fails if notification-service is down. Kafka lets these stay independent.

**Redis**
Used for WebSocket session/Pub-Sub scaling in messaging-service — if messaging-service ever runs multiple replicas, Redis Pub/Sub ensures a message from User A (connected to replica 1) reaches User B (connected to replica 2).

**Per-service database**
Enforces true service independence. A schema change in `job_db` can never accidentally break `auth_db` queries, and each service can evolve its data model independently.

---

## 4. Authentication & Authorization

1. User registers/logs in via `auth-service` → receives a JWT containing `userId`, `email`, `role`, `fullName`.
2. Every subsequent request includes `Authorization: Bearer <token>`.
3. `JwtAuthFilter` in the API Gateway validates the token signature and expiry, then forwards the request downstream with `X-User-Id`, `X-User-Email`, `X-User-Role`, `X-User-Name` headers.
4. Downstream services read these headers to know "who is calling" — they do not re-verify the JWT themselves (the gateway is the trust boundary).
5. Public routes (`/api/auth/**`, `/api/users/internal/**`, `/api/users/search`) bypass the JWT filter entirely.

---

## 5. Frontend Architecture

- **React Router** for client-side routing, with `ProtectedRoute`/`PublicRoute` wrappers gating access based on auth state.
- **Zustand** (`authStore`, `notificationStore`) for lightweight global state — persisted to survive page reloads.
- **TanStack Query** for all server-state (profiles, feed, connections, jobs) — handles caching, background refetching, and invalidation after mutations.
- **WebSocket (SockJS + STOMP)** connects directly to `messaging-service` for real-time chat; a custom `useWebSocket` hook manages the connection lifecycle and message handling.

---

## 6. Kubernetes Topology

```
Namespace: connectsphere
├── Infrastructure (StatefulSet-like, single replica)
│   ├── postgres        — 1 pod, PVC-backed
│   ├── redis            — 1 pod
│   ├── zookeeper        — 1 pod
│   └── kafka             — 1 pod (KRaft not used; Zookeeper-mode for compatibility)
├── Core Services (Deployments, 1 replica each on local dev cluster)
│   ├── eureka-server, config-server, api-gateway
│   └── auth/user/post/connection/messaging/notification/job-service
├── Frontend (Deployment + LoadBalancer Service)
└── Monitoring
    ├── prometheus       — scrapes /actuator/prometheus from every service
    └── grafana           — visualizes via Prometheus datasource
```

Every application service's Pod spec includes **init containers** (`wait-for-postgres`, `wait-for-kafka`, `wait-for-eureka` as applicable) that block startup until their dependency's port is reachable — this avoids the classic "crash-loop on first boot because the database wasn't ready yet" problem in Kubernetes, where there's no guaranteed startup ordering between Deployments.

See [`docs/troubleshooting.md`](troubleshooting.md) for the operational lessons learned running this stack on a single-node local cluster (memory sizing, Kafka/Zookeeper session handling, DNS/service port consistency).

---

## 7. Observability

- **Actuator** (`/actuator/health`, `/actuator/prometheus`) enabled on every service.
- **Prometheus** scrapes each service every 15s via a static + Kubernetes SD config.
- **Grafana** visualizes JVM memory, GC pauses, HTTP request rate/latency/error-rate, and thread counts using the community "Spring Boot Statistics" dashboard (ID 12900).

---

## 8. CI/CD Pipeline

```
Push to main
   │
   ├─▶ ci.yml    — runs unit tests for auth/post/job/connection-service + frontend build check
   │
   └─▶ deploy.yml — for each of 10 backend services + frontend:
                     1. Build JAR (Maven)
                     2. Build & tag Docker image (latest + git SHA)
                     3. Push to Docker Hub
                     4. Update image tags in k8s manifests, commit back to repo
```

This gives every deployed image full traceability back to the exact commit that produced it.