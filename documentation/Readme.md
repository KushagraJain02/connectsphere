# ConnectSphere

A full-stack, production-grade LinkedIn-clone built on a Spring Boot microservices backend and a React frontend — designed to demonstrate real-world distributed systems architecture, event-driven design, and cloud-native deployment practices.

![Java](https://img.shields.io/badge/Java-21-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.1-brightgreen)
![React](https://img.shields.io/badge/React-18-blue)
![Kubernetes](https://img.shields.io/badge/Kubernetes-ready-blue)
![Docker](https://img.shields.io/badge/Docker-ready-blue)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## Overview

ConnectSphere is a social/professional networking platform (think LinkedIn) built to explore and showcase:

- **Microservices architecture** — 9 independently deployable Spring Boot services
- **Event-driven communication** — Apache Kafka for async cross-service events
- **Service discovery & centralized config** — Netflix Eureka + Spring Cloud Config Server
- **Real-time features** — WebSocket-based messaging and live notifications
- **Full observability** — Prometheus metrics + Grafana dashboards
- **Cloud-native deployment** — Docker Compose for local dev, Kubernetes manifests for orchestration
- **CI/CD automation** — GitHub Actions pipeline for test → build → publish

---

## Features

| Domain | Capabilities |
|---|---|
| **Auth** | JWT-based registration/login, role-based access (User / Recruiter) |
| **Profiles** | Editable profile, skills, work experience, profile picture upload (Cloudinary) |
| **Feed** | Create/like/comment on posts, image uploads, real-time counts |
| **Network** | Send/accept/reject connection requests, manage connections |
| **Messaging** | Real-time 1:1 chat via WebSocket (STOMP/SockJS), conversation history |
| **Jobs** | Post jobs (recruiters), apply (users), track application status, recruiter dashboard |
| **Notifications** | Real-time in-app notifications + email alerts (Kafka-driven) |
| **Search** | Search people and job listings |

---

## Architecture

```
                              ┌─────────────┐
                              │   Frontend   │
                              │  (React SPA) │
                              └──────┬──────┘
                                     │
                              ┌──────▼──────┐
                              │ API Gateway │
                              │ (Spring     │
                              │  Cloud GW)  │
                              └──────┬──────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
      ┌───────▼───────┐     ┌───────▼───────┐      ┌───────▼───────┐
      │  Auth Service  │     │ User Service  │      │  Post Service │
      └───────┬───────┘     └───────┬───────┘      └───────┬───────┘
              │                      │                      │
      ┌───────▼───────┐     ┌───────▼───────┐      ┌───────▼───────┐
      │  Connection    │     │  Messaging    │      │ Notification  │
      │  Service       │     │  Service      │      │ Service       │
      └───────┬───────┘     └───────┬───────┘      └───────┬───────┘
              │                      │                      │
              │              ┌───────▼───────┐              │
              └──────────────►  Job Service   ◄──────────────┘
                             └───────────────┘

     All services register with Eureka Server & pull config from Config Server
     All services publish/consume events via Apache Kafka
     PostgreSQL (per-service DB) · Redis (cache/pub-sub) · Prometheus + Grafana (metrics)
```

See [`docs/architecture.md`](docs/architecture.md) for the full breakdown of each service, data flow, and design decisions.

---

## Tech Stack

**Backend**
- Java 21, Spring Boot 3.5.1, Spring Cloud 2024.0.1
- Spring Security + JWT
- Spring Data JPA + PostgreSQL
- Apache Kafka (event streaming)
- Redis (caching, Pub/Sub for WebSocket scaling)
- Netflix Eureka (service discovery)
- Spring Cloud Config Server (centralized configuration)
- Spring Cloud Gateway (API Gateway)

**Frontend**
- React 18 + Vite
- TanStack Query, Zustand
- Tailwind CSS
- SockJS + STOMP (WebSocket client)

**DevOps / Infrastructure**
- Docker & Docker Compose (local development)
- Kubernetes (production-style orchestration)
- GitHub Actions (CI/CD)
- Prometheus + Grafana (observability)
- Cloudinary (media storage)

---

## Project Structure

```
connectsphere/
├── eureka-server/          # Service discovery
├── config-server/          # Centralized configuration
├── api-gateway/            # Single entry point, JWT validation, routing
├── auth-service/           # Registration, login, JWT issuance
├── user-service/           # Profiles, skills, experience, media uploads
├── post-service/           # Posts, likes, comments, feed
├── connection-service/     # Connection requests & network graph
├── messaging-service/      # WebSocket real-time chat
├── notification-service/   # In-app + email notifications (Kafka consumer)
├── job-service/            # Job postings & applications
├── frontend/                # React SPA
├── k8s/                     # Kubernetes manifests (namespace, configmap, secrets,
│                             #   infrastructure/, services/, monitoring/, frontend/)
├── docs/                    # Architecture, API docs, troubleshooting notes
├── .github/workflows/       # CI/CD pipelines
├── docker-compose.yml       # Local multi-container orchestration
└── seed.js                  # Realistic demo-data seeding script
```

---

## Getting Started

### Prerequisites

- Java 21
- Node.js 20+
- Docker & Docker Compose
- (Optional) Minikube + kubectl for Kubernetes deployment

### Quick Start — Docker Compose (recommended for first run)

```bash
git clone https://github.com/YOUR_USERNAME/connectsphere.git
cd connectsphere

# Copy the environment template and fill in your own values
cp .env.example .env

docker-compose up --build
```

Once all containers are healthy:

```bash
# Seed realistic demo data (users, posts, jobs, connections, messages)
node seed.js
```

Open the app: **http://localhost:5173** (or wherever your frontend dev server is configured)

Test accounts (password for all: `password123`):

| Role | Email |
|---|---|
| User | rahul@connectsphere.com |
| User | priya@connectsphere.com |
| Recruiter | amit@techcorp.com |
| Recruiter | neha@startupxyz.com |

### Kubernetes Deployment

```bash
minikube start --memory=6144 --cpus=4 --driver=docker
minikube docker-env | Invoke-Expression   # Windows PowerShell
# eval $(minikube docker-env)             # macOS/Linux

# Build all service images inside minikube's Docker daemon
# (see docs/deployment.md for the full build loop)

cd k8s
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secrets.local.yaml   # your own file, gitignored — see secrets.yaml for template
kubectl apply -f infrastructure/
kubectl apply -f services/
kubectl apply -f frontend/
kubectl apply -f monitoring/

kubectl get pods -n connectsphere -w
```

Access via port-forward:

```bash
kubectl port-forward svc/frontend 3000:80 -n connectsphere
kubectl port-forward svc/api-gateway 8080:8080 -n connectsphere
kubectl port-forward svc/prometheus 9090:9090 -n connectsphere
kubectl port-forward svc/grafana 3001:3000 -n connectsphere
```

See [`docs/deployment.md`](docs/deployment.md) for full details, and [`docs/troubleshooting.md`](docs/troubleshooting.md) for common issues (Kafka/Zookeeper stability, memory sizing, DNS resolution) encountered while building this out on a local single-node cluster.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_gmail_app_password

JWT_SECRET=generate_a_long_random_string
```

**Never commit `.env` or `k8s/secrets.local.yaml`** — both are gitignored. `k8s/secrets.yaml` is a placeholder template checked into git.

---

## API Documentation

Full endpoint reference for every service is in [`docs/api/`](docs/api). A ready-to-import Postman collection is available at [`postman/ConnectSphere.postman_collection.json`](postman/ConnectSphere.postman_collection.json).

---

## Testing

```bash
cd auth-service && ./mvnw test
cd post-service && ./mvnw test
cd job-service && ./mvnw test
cd connection-service && ./mvnw test
```

CI runs these automatically on every push/PR via GitHub Actions (see `.github/workflows/ci.yml`).

---

## Monitoring

Prometheus scrapes `/actuator/prometheus` from every service. Grafana visualizes JVM heap, request rates, latency, and error rates via the imported [Spring Boot dashboard (ID 12900)](https://grafana.com/grafana/dashboards/12900).

---

## Roadmap

- [x] Microservices backend (9 services)
- [x] React frontend
- [x] Kafka event-driven architecture
- [x] Kubernetes deployment
- [x] CI/CD pipeline
- [x] Prometheus + Grafana monitoring
- [ ] Cloud deployment (AWS EKS / DigitalOcean)
- [ ] Distributed tracing (Zipkin/Jaeger)
- [ ] Rate limiting at the gateway

---

## License

MIT — free to use, modify, and learn from.