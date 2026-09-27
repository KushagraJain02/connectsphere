# start.ps1 -- One command to start everything
# Usage: .\start.ps1
# Usage (if images gone): .\start.ps1 -RebuildImages

param([switch]$RebuildImages)

$root = "C:\Web Development Practice\connectsphere"
$namespace = "connectsphere"

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "     ConnectSphere -- Starting Up          " -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# -- Step 1: Check Docker Desktop --------------------------
Write-Host "[Docker] Checking Docker Desktop..." -ForegroundColor Yellow
$dockerRunning = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Docker Desktop is not running!" -ForegroundColor Red
    Write-Host "   Please open Docker Desktop and wait for it to start, then run this script again." -ForegroundColor Gray
    exit 1
}
Write-Host "   [OK] Docker Desktop is running" -ForegroundColor Green

# -- Step 2: Start minikube ---------------------------------
Write-Host "`n[Kubernetes] Starting minikube..." -ForegroundColor Yellow
$minikubeStatus = minikube status 2>&1
if ($minikubeStatus -match "Running") {
    Write-Host "   [OK] minikube already running" -ForegroundColor Green
} else {
    minikube start --memory=6144 --cpus=4 --driver=docker
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] minikube failed to start" -ForegroundColor Red
        exit 1
    }
    Write-Host "   [OK] minikube started" -ForegroundColor Green
}

# -- Step 3: Point Docker to minikube -----------------------
Write-Host "`n[Config] Configuring Docker to use minikube..." -ForegroundColor Yellow
minikube docker-env | Invoke-Expression
Write-Host "   [OK] Docker pointing to minikube" -ForegroundColor Green

# -- Step 4: Check if images exist --------------------------
Write-Host "`n[Images] Checking Docker images..." -ForegroundColor Yellow
$images = docker images | Select-String "connectsphere/"
if (-not $images -or $RebuildImages) {
    Write-Host "   [WARN] Images missing -- rebuilding..." -ForegroundColor Yellow

    # Pull base images
    Write-Host "   Pulling base images..." -ForegroundColor Gray
    docker pull confluentinc/cp-zookeeper:7.5.0 -q
    docker pull confluentinc/cp-kafka:7.5.0 -q
    docker pull busybox:1.35 -q
    docker pull postgres:16-alpine -q
    docker pull redis:7-alpine -q

    # Build service images
    $services = @(
        "eureka-server","config-server","api-gateway",
        "auth-service","user-service","post-service",
        "connection-service","messaging-service",
        "notification-service","job-service"
    )

    foreach ($svc in $services) {
        Write-Host "   Building $svc..." -ForegroundColor Gray
        Set-Location "$root\$svc"
        ./mvnw clean package -DskipTests -q
        docker build -t "connectsphere/${svc}:latest" . -q
        if ($LASTEXITCODE -ne 0) {
            Write-Host "   [ERROR] Failed to build $svc" -ForegroundColor Red
            exit 1
        }
    }

    Write-Host "   Building frontend..." -ForegroundColor Gray
    Set-Location "$root\frontend"
    npm run build --silent
    docker build -t "connectsphere/frontend:latest" . -q

    Set-Location $root
    Write-Host "   [OK] All images built" -ForegroundColor Green
} else {
    Write-Host "   [OK] Images found -- skipping rebuild" -ForegroundColor Green
}

# -- Step 5: Check if pods already running --------------------
Write-Host "`n[K8s] Checking Kubernetes pods..." -ForegroundColor Yellow
$pods = kubectl get pods -n $namespace 2>&1
$runningCount = ($pods | Select-String "1/1     Running").Count

if ($runningCount -ge 14) {
    Write-Host "   [OK] All pods already running ($runningCount/17)" -ForegroundColor Green
} else {
    Write-Host "   Pods not fully up ($runningCount running) -- deploying..." -ForegroundColor Gray

    Set-Location "$root\k8s"

    # Apply manifests in correct order
    kubectl apply -f namespace.yaml | Out-Null
    kubectl apply -f configmap.yaml | Out-Null
    kubectl apply -f secrets.local.yaml | Out-Null

    Write-Host "   Starting infrastructure..." -ForegroundColor Gray
    kubectl apply -f infrastructure/postgres.yaml | Out-Null
    kubectl apply -f infrastructure/redis.yaml | Out-Null
    kubectl apply -f infrastructure/zookeeper.yaml | Out-Null

    Write-Host "   Waiting 30s for zookeeper..." -ForegroundColor Gray
    Start-Sleep -Seconds 30

    kubectl apply -f infrastructure/kafka.yaml | Out-Null
    Write-Host "   Waiting 60s for kafka..." -ForegroundColor Gray
    Start-Sleep -Seconds 60

    Write-Host "   Starting services..." -ForegroundColor Gray
    kubectl apply -f services/ | Out-Null
    kubectl apply -f frontend/ | Out-Null
    kubectl apply -f monitoring/ | Out-Null

    Write-Host "   [OK] Manifests applied" -ForegroundColor Green

    # Wait for pods to be ready
    Write-Host "`nWaiting for all pods to be ready (this takes ~2-3 minutes)..." -ForegroundColor Yellow
    $maxWait = 180
    $waited = 0
    $interval = 15

    while ($waited -lt $maxWait) {
        Start-Sleep -Seconds $interval
        $waited += $interval
        $pods = kubectl get pods -n $namespace 2>&1
        $running = ($pods | Select-String "1/1     Running").Count
        $total = ($pods | Select-String -NotMatch "NAME|Terminating").Count
        Write-Host "   [$waited s] $running/$total pods ready..." -ForegroundColor Gray
        if ($running -ge 14) { break }
    }
}

# -- Step 6: Start port forwarding ----------------------------
Write-Host "`n[Network] Starting port forwarding..." -ForegroundColor Yellow

# Kill any existing port-forward processes
Get-Process -Name "kubectl" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -match "port-forward"
} | Stop-Process -Force -ErrorAction SilentlyContinue

# Start port forwards in background jobs
$portForwards = @(
    @{ svc = "frontend";       local = 3000; remote = 80   },
    @{ svc = "api-gateway";    local = 8080; remote = 8080 },
    @{ svc = "eureka-server";  local = 8761; remote = 8761 },
    @{ svc = "prometheus";     local = 9090; remote = 9090 },
    @{ svc = "grafana";        local = 3001; remote = 3000 },
    @{ svc = "postgres";       local = 5433; remote = 5433 }
)

foreach ($pf in $portForwards) {
    Start-Job -ScriptBlock {
        param($svc, $local, $remote, $ns)
        kubectl port-forward "svc/$svc" "${local}:${remote}" -n $ns 2>&1 | Out-Null
    } -ArgumentList $pf.svc, $pf.local, $pf.remote, $namespace | Out-Null
    Write-Host "   [OK] $($pf.svc) -> localhost:$($pf.local)" -ForegroundColor Green
}

# -- Step 7: Final status --------------------------------------
Write-Host "`n============================================" -ForegroundColor Green
Write-Host "     ConnectSphere is READY!                " -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

Write-Host "`nAccess your app:" -ForegroundColor Cyan
Write-Host "   Frontend:    http://localhost:3000" -ForegroundColor White
Write-Host "   API Gateway: http://localhost:8080" -ForegroundColor White
Write-Host "   Eureka:      http://localhost:8761" -ForegroundColor White
Write-Host "   Prometheus:  http://localhost:9090" -ForegroundColor White
Write-Host "   Grafana:     http://localhost:3001  (admin/admin123)" -ForegroundColor White
Write-Host "   DBeaver:     localhost:5433  (postgres/postgre)" -ForegroundColor White

Write-Host "`nUseful commands:" -ForegroundColor Cyan
Write-Host "   kubectl get pods -n connectsphere" -ForegroundColor Gray
Write-Host "   kubectl logs -f deployment/auth-service -n connectsphere" -ForegroundColor Gray
Write-Host "   Stop-Job * ; Remove-Job *   <- stop all port-forwards" -ForegroundColor Gray

Write-Host "`nRun seed script:" -ForegroundColor Cyan
Write-Host "   node seed.js" -ForegroundColor Gray

Write-Host ""