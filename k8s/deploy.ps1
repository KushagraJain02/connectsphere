# ConnectSphere Kubernetes Deploy Script
Write-Host "🚀 Deploying ConnectSphere to Kubernetes..." -ForegroundColor Cyan

# Point Docker to minikube's registry
minikube docker-env | Invoke-Expression

# Build all Docker images
Write-Host "`n📦 Building Docker images..." -ForegroundColor Yellow

$services = @(
    "eureka-server",
    "config-server",
    "api-gateway",
    "auth-service",
    "user-service",
    "post-service",
    "connection-service",
    "messaging-service",
    "notification-service",
    "job-service"
)

foreach ($service in $services) {
    Write-Host "  Building $service..." -ForegroundColor Gray
    Set-Location "../$service"
    ./mvnw clean package -DskipTests -q
    docker build -t "connectsphere/$service:latest" .
    Set-Location "../k8s"
}

# Build frontend
Write-Host "  Building frontend..." -ForegroundColor Gray
Set-Location "../frontend"
npm run build
docker build -t "connectsphere/frontend:latest" .
Set-Location "../k8s"

# Apply Kubernetes manifests
Write-Host "`n☸️  Applying Kubernetes manifests..." -ForegroundColor Yellow

kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secrets.yaml

Write-Host "  Deploying infrastructure..." -ForegroundColor Gray
kubectl apply -f infrastructure/

Write-Host "  Waiting for infrastructure..." -ForegroundColor Gray
kubectl wait --for=condition=ready pod -l app=postgres -n connectsphere --timeout=120s
kubectl wait --for=condition=ready pod -l app=redis -n connectsphere --timeout=60s
kubectl wait --for=condition=ready pod -l app=kafka -n connectsphere --timeout=120s

Write-Host "  Deploying services..." -ForegroundColor Gray
kubectl apply -f services/
kubectl apply -f frontend/

Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
Write-Host "`n📊 Pod status:" -ForegroundColor Cyan
kubectl get pods -n connectsphere

Write-Host "`n🌐 Getting service URLs..." -ForegroundColor Cyan
minikube service api-gateway -n connectsphere --url
minikube service frontend -n connectsphere --url