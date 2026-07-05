# Deployment Guide

## Local Development — Docker Compose

```bash
cp .env.example .env    # fill in real values
docker-compose up --build
node seed.js             # populate demo data
```

Services come up in this order (via `depends_on` + healthchecks): `postgres/redis/kafka/zookeeper` → `eureka-server` → `config-server` → `api-gateway` → all business services → `frontend`.

---

## Kubernetes — Minikube (local cluster)

### 1. Start the cluster

```bash
minikube start --memory=6144 --cpus=4 --driver=docker
minikube docker-env | Invoke-Expression   # PowerShell
```

### 2. Build all images inside minikube's Docker daemon

```powershell
docker pull confluentinc/cp-zookeeper:7.5.0
docker pull confluentinc/cp-kafka:7.5.0
docker pull busybox:1.35

$services = @("eureka-server","config-server","api-gateway","auth-service",
              "user-service","post-service","connection-service",
              "messaging-service","notification-service","job-service")

foreach ($svc in $services) {
    Set-Location $svc
    ./mvnw clean package -DskipTests -q
    docker build -t "connectsphere/${svc}:latest" . -q
    Set-Location ..
}

Set-Location frontend
docker build -t "connectsphere/frontend:latest" . -q
Set-Location ..
```

### 3. Create your local secrets file (never committed)

Copy `k8s/secrets.yaml` to `k8s/secrets.local.yaml` and fill in real values for `POSTGRES_PASSWORD`, `CLOUDINARY_*`, and `MAIL_*`.

### 4. Deploy, in dependency order

```bash
cd k8s
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secrets.local.yaml

kubectl apply -f infrastructure/postgres.yaml
kubectl apply -f infrastructure/redis.yaml
kubectl apply -f infrastructure/zookeeper.yaml
# wait ~30s for zookeeper to be ready before kafka
kubectl apply -f infrastructure/kafka.yaml
# wait ~45s for kafka to be ready

kubectl apply -f services/
kubectl apply -f frontend/
kubectl apply -f monitoring/
```

### 5. Verify

```bash
kubectl get pods -n connectsphere
```

Every pod should reach `1/1 Running` with `RESTARTS: 0`. If not, see [`troubleshooting.md`](troubleshooting.md).

### 6. Access services locally

```bash
kubectl port-forward svc/frontend 3000:80 -n connectsphere
kubectl port-forward svc/api-gateway 8080:8080 -n connectsphere
kubectl port-forward svc/eureka-server 8761:8761 -n connectsphere
kubectl port-forward svc/prometheus 9090:9090 -n connectsphere
kubectl port-forward svc/grafana 3001:3000 -n connectsphere
kubectl port-forward svc/postgres 5433:5433 -n connectsphere   # for DBeaver etc.
```

---

## Updating a running deployment

Never restart every Deployment at once. One at a time, verified:

```bash
kubectl apply -f services/auth-service.yaml
kubectl rollout restart deployment/auth-service -n connectsphere
kubectl rollout status deployment/auth-service -n connectsphere --timeout=90s
```

Only proceed to the next service once the previous one reports success.

---

## Recovering after a laptop restart

Minikube preserves cluster + image state across `minikube stop` / `minikube start` (but **not** across `minikube delete`).

```bash
minikube start --memory=6144 --cpus=4 --driver=docker
minikube docker-env | Invoke-Expression
docker images | grep connectsphere   # confirm images survived
kubectl get pods -n connectsphere    # confirm pods come back automatically
```

If images are gone (only happens after `minikube delete`), repeat the full build loop from Step 2.

---

## CI/CD

GitHub Actions handles build/test/publish automatically on every push to `main`:

- `.github/workflows/ci.yml` — runs backend unit tests + frontend build check
- `.github/workflows/deploy.yml` — builds and pushes Docker images for all 11 components to Docker Hub, tagged `latest` and `<git-sha>`

Required GitHub repo secrets: `DOCKER_USERNAME`, `DOCKER_PASSWORD` (Docker Hub access token), `JWT_SECRET`.