# Rebuild all images first
minikube docker-env | Invoke-Expression
docker pull confluentinc/cp-zookeeper:7.5.0
docker pull confluentinc/cp-kafka:7.5.0
docker pull postgres:16-alpine
docker pull redis:7-alpine
docker pull busybox:1.35

$root = "C:\Web Development Practice\connectsphere"
$services = @("eureka-server","config-server","api-gateway","auth-service","user-service","post-service","connection-service","messaging-service","notification-service","job-service")
foreach ($svc in $services) {
    Set-Location "$root\$svc"
    docker build -t "connectsphere/$svc:latest" . -q
}
Set-Location "$root\frontend"
docker build -t "connectsphere/frontend:latest" . -q

# Then apply manifests
Set-Location "$root\k8s"
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secrets.yaml
kubectl apply -f infrastructure/postgres.yaml
kubectl apply -f infrastructure/redis.yaml
kubectl apply -f infrastructure/zookeeper.yaml
Start-Sleep -Seconds 30
kubectl apply -f infrastructure/kafka.yaml
Start-Sleep -Seconds 60
kubectl apply -f services/
kubectl apply -f frontend/
kubectl scale deployment --all --replicas=1 -n connectsphere