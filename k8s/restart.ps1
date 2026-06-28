# restart.ps1 — Run after every minikube restart
param(
    [switch]$RebuildImages  # Pass -RebuildImages if images are gone
)

$root = "C:\Web Development Practice\connectsphere"

Write-Host "🚀 Starting ConnectSphere on Kubernetes..." -ForegroundColor Cyan

# Point Docker to minikube
minikube docker-env | Invoke-Expression

if ($RebuildImages) {
    Write-Host "📦 Pulling base images..." -ForegroundColor Yellow
    docker pull confluentinc/cp-zookeeper:7.5.0 -q
    docker pull confluentinc/cp-kafka:7.5.0 -q
    docker pull postgres:16-alpine -q
    docker pull redis:7-alpine -q
    docker pull busybox:1.35 -q

    Write-Host "🏗️ Building service images..." -ForegroundColor Yellow
    $services = @("eureka-server","config-server","api-gateway","auth-service",
                  "user-service","post-service","connection-service","messaging-service",
                  "notification-service","job-service")
    foreach ($svc in $services) {
        Write-Host "  Building $svc..." -ForegroundColor Gray
        Set-Location "$root\$svc"
        docker build -t "connectsphere/$svc:latest" . -q
    }
    Set-Location "$root\frontend"
    docker build -t "connectsphere/frontend:latest" . -q
}

Write-Host "☸️ Deploying to Kubernetes..." -ForegroundColor Yellow
Set-Location "$root\k8s"

kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secrets.yaml
kubectl apply -f infrastructure/postgres.yaml
kubectl apply -f infrastructure/redis.yaml
kubectl apply -f infrastructure/zookeeper.yaml

Write-Host "⏳ Waiting 30s for zookeeper..." -ForegroundColor Gray
Start-Sleep -Seconds 30

kubectl apply -f infrastructure/kafka.yaml
Write-Host "⏳ Waiting 60s for kafka..." -ForegroundColor Gray
Start-Sleep -Seconds 60

kubectl apply -f services/
kubectl apply -f frontend/
kubectl scale deployment --all --replicas=1 -n connectsphere

Write-Host "✅ Done!" -ForegroundColor Green
kubectl get pods -n connectsphere