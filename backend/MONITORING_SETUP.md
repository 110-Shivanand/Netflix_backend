# Prometheus & Grafana Monitoring Setup Guide

## Quick Start

### 1. Local Development (Docker Desktop)

```bash
cd backend

# Create/update .env with Grafana credentials
cp .env.example .env
# Edit .env and set:
# GRAFANA_ADMIN_USER=admin
# GRAFANA_ADMIN_PASSWORD=your_secure_password

# Start all services
docker compose up -d

# Wait for services to start (~15 seconds)
sleep 15

# Verify services are running
docker compose ps
```

Expected output:
```
NAME                STATUS
movies_api          Up (healthy)
movies_prometheus   Up (healthy)
movies_grafana      Up (healthy)
```

### 2. EC2 Deployment

#### Prerequisites
- SSH key for EC2 instance
- EC2 Security Group allows ports: 8000, 3000, 9090 (optional)

#### Deploy Steps

```bash
# 1. SSH into EC2
ssh -i your-key.pem ubuntu@34.230.63.221

# 2. Navigate to deployment directory
cd ~/movies-api

# 3. Update .env (if needed)
cat > .env <<'EOF'
APP_NAME=Movies API
ENVIRONMENT=production

OMDB_API_KEY=9daaf95
OMDB_BASE_URL=http://www.omdbapi.com/

ALLOWED_ORIGINS=https://yourdomain.com,http://34.230.63.221

API_PORT=8000
WORKERS=4
CPU_LIMIT=1.0
MEM_LIMIT=512m

DOCKERHUB_USERNAME=your_dockerhub_username
IMAGE_TAG=latest

GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=your_secure_password
EOF

# 4. Pull latest images
docker compose pull

# 5. Start all services
docker compose up -d

# 6. Verify deployment
docker compose ps
docker compose logs api --tail 20
docker compose logs prometheus --tail 20
docker compose logs grafana --tail 20
```

---

## Verification Commands

### Check Services Status

```bash
# All containers running?
docker compose ps

# Healthy?
docker compose ps --format "table {{.Names}}\t{{.Status}}"
```

### Verify Backend Metrics Endpoint

```bash
# Local machine
curl http://localhost:8000/metrics | head -20

# EC2 machine (from inside container)
docker compose exec api curl http://localhost:8000/metrics | head -20

# Or from host
curl http://localhost:8000/metrics
```

Expected: Should return Prometheus metrics starting with `# HELP` comments.

### Verify Prometheus Can Scrape Backend

```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | {job: .labels.job, instance: .labels.instance, health: .health}'

# Or view in UI: http://localhost:9090 → Status → Targets
```

Expected: `movies-api` job should show `UP` status.

### Verify Grafana Datasource

```bash
# Check Grafana datasources via API
curl -u admin:admin http://localhost:3000/api/datasources | jq '.[] | {name: .name, type: .type, url: .url}'

# Or view in UI: http://localhost:3000 → Administration → Data Sources
```

Expected: Prometheus datasource should show as active.

### View Dashboard

Open browser:
- **Grafana**: http://localhost:3000 (or http://EC2_IP:3000)
- **Prometheus**: http://localhost:9090 (or http://EC2_IP:9090)

Login to Grafana:
- Username: `admin` (or value of `GRAFANA_ADMIN_USER`)
- Password: `admin` (or value of `GRAFANA_ADMIN_PASSWORD`)

Dashboard should auto-load: **Movies API Monitoring Dashboard**

---

## Common Queries for Testing

### Check Request Rate
```bash
curl 'http://localhost:9090/api/v1/query?query=rate(fastapi_requests_total[1m])' | jq '.'
```

### Check Error Rate
```bash
curl 'http://localhost:9090/api/v1/query?query=rate(fastapi_requests_total{status=~"5.."}[5m])' | jq '.'
```

### Check Backend Availability
```bash
curl 'http://localhost:9090/api/v1/query?query=up{job="movies-api"}' | jq '.'
```

---

## Generate Test Traffic (Optional)

To populate metrics for testing:

```bash
# Generate search requests
for i in {1..10}; do
  curl "http://localhost:8000/movies?search=action&page=1" &
done
wait

# Generate detail requests
curl "http://localhost:8000/movies/tt0120737"
curl "http://localhost:8000/movies/tt0468569"

# Test health endpoint
curl http://localhost:8000/health
```

Then check Grafana dashboard for updated metrics.

---

## Stopping Services

```bash
# Stop all containers (data preserved in volumes)
docker compose down

# Stop and remove all data
docker compose down -v
```

---

## Data Persistence

Volumes are automatically created:
- `prometheus_data`: Stores 30 days of metrics
- `grafana_data`: Stores dashboards, users, settings

To backup:
```bash
# Backup Prometheus data
docker run --rm -v prometheus_data:/data -v $(pwd):/backup \
  busybox tar czf /backup/prometheus_backup.tar.gz -C /data .

# Backup Grafana data
docker run --rm -v grafana_data:/data -v $(pwd):/backup \
  busybox tar czf /backup/grafana_backup.tar.gz -C /data .
```

---

## Production Recommendations

1. **Change Grafana Admin Password**
   - Login → Administration → Users → Admin → Change password

2. **Use HTTPS/SSL**
   - Put Nginx reverse proxy in front of Grafana (port 3000 → 443)
   - Keep Prometheus internal (don't expose to internet)

3. **Restrict Access**
   - Use AWS Security Groups to limit port 3000 to your IP
   - Or use IP whitelisting in reverse proxy

4. **Monitoring Alerts**
   - Set up alert rules in Prometheus for critical metrics
   - Configure Alertmanager for notifications (email, Slack, etc.)

5. **Backup Schedule**
   - Set up cron job to backup volumes regularly
   - Store backups in S3 or another durable location

---

## Troubleshooting

### Prometheus can't scrape backend

```bash
# Check if backend is accessible from prometheus container
docker compose exec prometheus curl http://api:8000/metrics

# Check prometheus.yml config
docker compose exec prometheus cat /etc/prometheus/prometheus.yml
```

### Grafana won't connect to Prometheus

```bash
# Verify network connectivity
docker compose exec grafana curl http://prometheus:9090

# Check Grafana logs
docker compose logs grafana
```

### Dashboard not showing data

1. Wait 30-60 seconds for Prometheus to scrape metrics
2. Generate some test traffic (see "Generate Test Traffic" above)
3. Check Prometheus UI for active targets

### Out of disk space (Prometheus)

```bash
# Check volume size
docker volume inspect prometheus_data

# Reduce retention in docker-compose.yml
# storage.tsdb.retention.time=7d  (change to 7d for smaller storage)

# Recreate Prometheus with new config
docker compose down prometheus
docker compose up -d prometheus
```

---

## Support

For issues, check:
1. `docker compose logs <service_name>`
2. Prometheus Status page: http://localhost:9090/status
3. Grafana logs: Administration → Logs
