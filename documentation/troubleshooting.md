# Troubleshooting & Operational Notes

This document captures real issues encountered while running ConnectSphere on a local single-node Kubernetes cluster (minikube), and how they were diagnosed and resolved. Kept here deliberately — these are the kinds of problems that come up in any real Kubernetes environment, and the diagnostic process is as valuable as the fix.

---

## 1. Pods stuck in `Init:0/2` forever

**Symptom:** New pods never leave `Init:0/2`, even though the dependency they're waiting on (e.g., postgres) shows `1/1 Running`.

**Diagnosis:**
```bash
kubectl logs <pod> -c wait-for-postgres
# → "waiting for postgres" repeating forever

kubectl exec -it <pod> -c wait-for-postgres -- nc -zv postgres 5432
# → connection refused
```

**Root cause:** The Postgres `Service` was reconfigured to listen on port `5433` (to match a local DBeaver/Windows Postgres setup) but the init container command and `SPRING_DATASOURCE_URL` in service manifests still referenced the old port `5432`. The Service simply didn't expose that port anymore.

**Fix:** Keep the port used in:
- `postgres` Service (`spec.ports[].port`)
- every service's init container command (`nc -z postgres <port>`)
- every service's `SPRING_DATASOURCE_URL`

...consistent across all manifests. A quick way to verify:
```bash
kubectl get svc postgres -n connectsphere -o yaml | grep -A2 ports
grep -r "postgres:54" k8s/services/
```

---

## 2. Kafka `CrashLoopBackOff` after long uptime

**Symptom:** Kafka runs fine for hours/days, then suddenly crash-loops.

**Diagnosis:**
```bash
kubectl logs -l app=kafka -n connectsphere --previous
# → org.apache.zookeeper.KeeperException$NodeExistsException: KeeperErrorCode = NodeExists
#   ... at kafka.zk.KafkaZkClient.registerBroker
```

**Root cause:** Zookeeper retained a stale ephemeral node (`/brokers/ids/1`) from a previous Kafka session that hadn't expired yet, so the new Kafka process couldn't re-register with the same broker ID.

**Fix:** Ensure Zookeeper's data/log directories use `emptyDir` volumes (not persisted across pod restarts) so a Zookeeper restart always starts from a clean slate:
```yaml
volumes:
  - name: zookeeper-data
    emptyDir: {}
  - name: zookeeper-log
    emptyDir: {}
```
When it does happen, the reliable recovery is: delete both Kafka and Zookeeper Deployments, redeploy Zookeeper first, wait for it to be ready, then redeploy Kafka.

---

## 3. Kafka `OOMKilled`

**Symptom:** `kubectl describe pod <kafka-pod>` shows `Reason: OOMKilled`, `Restart Count` climbing.

**Diagnosis:**
```bash
kubectl describe pod -l app=kafka -n connectsphere | grep -A2 "Last State"
# → Reason: OOMKilled
```

**Root cause:** The JVM's default heap sizing tries to claim memory based on the host's total visible memory, not the container's cgroup limit, so it can exceed the Pod's `resources.limits.memory`.

**Fix:** Explicitly cap the JVM heap below the container's memory limit:
```yaml
env:
  - name: KAFKA_HEAP_OPTS
    value: "-Xmx512M -Xms256M"
resources:
  limits:
    memory: "1Gi"   # heap + off-heap/page-cache headroom
```

---

## 4. `advertised.listeners cannot use the nonroutable meta-address 0.0.0.0`

**Symptom:** Kafka fails immediately on startup with this exact error.

**Root cause:** `KAFKA_ADVERTISED_LISTENERS` was set to `0.0.0.0`, which Kafka explicitly rejects — it must be an address other clients/brokers can actually route to.

**Fix:** Use the Pod's own IP, injected via the Downward API:
```yaml
env:
  - name: POD_IP
    valueFrom:
      fieldRef:
        fieldPath: status.podIP
  - name: KAFKA_ADVERTISED_LISTENERS
    value: "PLAINTEXT://$(POD_IP):9092"
```

---

## 5. `KAFKA_PORT` env var showing "deprecated" warning and interfering with config

**Symptom:** Kafka logs show `port is deprecated. Please use KAFKA_ADVERTISED_LISTENERS instead.`

**Root cause:** Kubernetes automatically injects a `KAFKA_PORT` environment variable into every pod in the namespace once a Service named `kafka` exists (Kubernetes' legacy service-linking behavior: `<SVCNAME>_PORT`). The Kafka container image's entrypoint script picks this up and gets confused by it.

**Fix:** Explicitly override/blank it in the container's own env list (which takes precedence over the auto-injected one):
```yaml
env:
  - name: KAFKA_PORT
    value: ""
```

---

## 6. Duplicate ReplicaSets — two versions of a Deployment running simultaneously

**Symptom:** `kubectl get replicasets` shows two ReplicaSets for the same Deployment, both with `DESIRED: 1`, one healthy and one permanently stuck.

**Root cause:** Applying an edited manifest (e.g., changing an env var) creates a new ReplicaSet as part of the normal rolling update. If the new pod never becomes Ready (due to an unrelated issue, like #1 above), the rollout never completes and Kubernetes keeps both ReplicaSets around — this doubles resource consumption (CPU/memory/DB connections) until resolved.

**Diagnosis:**
```bash
kubectl get replicasets -n connectsphere
# look for two RS with the same app label, both DESIRED:1
```

**Fix:** Once the underlying blocker is fixed, delete the stuck ReplicaSet manually if it doesn't clean itself up:
```bash
kubectl delete replicaset <stuck-rs-name> -n connectsphere
```
**Prevention:** Never run `kubectl rollout restart` on many Deployments simultaneously — do them one at a time and confirm each with `kubectl rollout status` before moving to the next. This avoids compounding failures and makes root-causing much easier.

---

## 7. PostgreSQL `FATAL: sorry, too many clients already`

**Symptom:** Services crash on startup with a Hibernate/HikariCP connection failure wrapping this Postgres error.

**Root cause:** Each service instance opens its own HikariCP connection pool (default max size: 10). With 10 services × 2 replicas × 10 connections = up to 200 concurrent connections, easily exceeding Postgres's default `max_connections` (100).

**Fix:** Cap the pool size per service instance via environment variables (no rebuild needed):
```yaml
env:
  - name: SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE
    value: "5"
  - name: SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE
    value: "2"
```
Combined with running a sensible number of replicas for a local single-node cluster (see #8).

---

## 8. Minikube running out of memory ("no space to run services")

**Symptom:** Pods stuck `Pending`, `kubectl` commands time out with `TLS handshake timeout`, `minikube ssh -- free -h` shows almost 0 free memory.

**Root cause:** Running 2 replicas of all 10 backend services, plus Kafka, Zookeeper, Postgres, Redis, Prometheus, and Grafana, comfortably exceeds what a 6-8GB minikube VM can hold — especially once duplicate ReplicaSets (see #6) are also in the mix.

**Fix:**
- Set `replicas: 1` directly in every Deployment manifest for local/demo use — this is the permanent fix (rather than remembering to `kubectl scale` after every restart).
- Explicitly cap Kafka's JVM heap (see #3).
- Give minikube a realistic memory budget for your host: `minikube start --memory=6144 --cpus=4` (adjust up only if your host has genuine headroom beyond Docker Desktop's own overhead).

**Diagnosis commands used throughout:**
```bash
minikube ssh -- free -h
docker system df
kubectl describe pod <pod> | grep -A5 Events
kubectl top pods -n connectsphere   # if metrics-server is enabled
```

---

## 9. Prometheus targets showing `DOWN` with `404 Not Found`

**Symptom:** Prometheus `/targets` page shows most services `DOWN` with a 404 error on `/actuator/prometheus`.

**Root cause:** The `micrometer-registry-prometheus` Maven dependency was present in every service's `pom.xml`, but the actual actuator exposure config (`management.endpoints.web.exposure.include: prometheus`) was only added to `config-server`'s `application.yml` — every other service never actually exposed the endpoint, so it genuinely didn't exist.

**Fix:** Add to every service's `application.yml` (or the shared config-server config all services import):
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus,metrics
```

---

## 10. Prometheus target `DOWN` with `403`

**Symptom:** One specific service (auth-service) 403s on `/actuator/prometheus` while others 404 or work.

**Root cause:** Spring Security's filter chain didn't have an explicit `permitAll()` rule for `/actuator/**`, so it fell through to the default `anyRequest().authenticated()` rule.

**Fix:**
```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/auth/**").permitAll()
    .requestMatchers("/actuator/**").permitAll()
    .anyRequest().authenticated()
)
```

---

## 11. GitHub Actions: `./mvnw: Permission denied`

**Symptom:** CI/CD pipeline fails with exit code 126 on the very first Maven step.

**Root cause:** The `mvnw` wrapper script loses its Unix executable bit when generated/committed from Windows.

**Fix:** Add an explicit `chmod` step before invoking it in every workflow job:
```yaml
- name: Make mvnw executable
  working-directory: auth-service
  run: chmod +x mvnw
```

---

## 12. `@MockBean` deprecation warnings / removal in newer Spring Boot

**Symptom:** `@WebMvcTest` controller tests fail to load context or show deprecation warnings targeting removal.

**Fix:** Replace `@MockBean` with `@MockitoBean` (Spring Boot 3.4+):
```java
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@MockitoBean
private AuthService authService;
```

---

## General debugging checklist

When a pod won't come up cleanly, this is the order that reliably narrows down the cause:

```bash
kubectl get pods -n connectsphere                          # overall state
kubectl describe pod <pod> -n connectsphere                 # Events section at the bottom
kubectl logs <pod> -n connectsphere                          # current container logs
kubectl logs <pod> -n connectsphere --previous               # logs from the last crash
kubectl logs <pod> -n connectsphere -c <init-container-name> # init container specifically
kubectl get svc <name> -n connectsphere -o yaml               # confirm actual ports exposed
kubectl exec -it <pod> -n connectsphere -- nc -zv <target> <port>  # raw connectivity test
kubectl get replicasets -n connectsphere                       # check for duplicates
minikube ssh -- free -h                                         # memory pressure
```