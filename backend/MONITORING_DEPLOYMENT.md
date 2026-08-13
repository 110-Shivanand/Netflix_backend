# Prometheus & Grafana Monitoring - Complete Deployment Guide

## 📋 Overview

This guide covers deploying Prometheus and Grafana monitoring to your existing Netflix backend on AWS EC2. The setup is **non-invasive**—all monitoring services are optional and don't affect the core API functionality.

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        EC2 Instance                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Docker Compose Network: backend_net             │  │
│  │                                                          │  │
│  │  ┌─────────────────┐  ┌──────────────┐  ┌────────────┐  │  │
│  │  │  FastAPI API    │  │ Prometheus   │  │  Grafana   │  │  │
│  │  │  :8000          │  │  :9090       │  │  :3000     │  │  │
│  │  │  /metrics ◄─────┼──┤ scrapes every│  │  reads ◄───┼──┤  │
│  │  │                 │  │  15s         │  │  metrics   │  │  │
│  │  └─────────────────┘  │              │  │            │  │  │
│  │                       └──────────────┘  └────────────┘  │  │
│  │                                                          │  │
│  │  Volumes:                                               │  │
│  │  • prometheus_data: /prometheus (30-day retention)     │  │
│  │  • grafana_data: /var/lib/grafana                      │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  AWS Security Group:                                           │
│  • Port 8000 → API (existing)                                  │
│  • Port 9090 → Prometheus (optional)                           │
│  • Port 3000 → Grafana (for testing/initial setup)            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔒 AWS EC2 Security Group Configuration

Your EC2 instance needs inbound rules for the new monitoring services.

### Current Rules (Existing)
- **Port 8000** (API) - Already configured

### Add These Rules

| Type           | Protocol | Port  | Source        | Purpose                          |
|----------------|----------|-------|---------------|----------------------------------|
| Custom TCP     | TCP      | 9090  | Your IP/CIDR  | Prometheus (optional, internal)  |
| Custom TCP     | TCP      | 3000  | Your IP/CIDR  | Grafana (testing & setup)        |

### How to Add Rules

1. **AWS Console:**
   - Go to **EC2 → Instances** → Select your instance
   - Click **Security** tab
   - Click the **Security Group** link
   - Click **Edit Inbound Rules**
   - Add:
     ```
     Type: Custom TCP, Port: 9090, Source: 0.0.0.0/0 (or your IP)
     Type: Custom TCP, Port: 3000, Source: 0.0.0.0/0 (or your IP)
     ```
   - Save

2. **AWS CLI:**
   ```bash
   SG_ID=sg-xxxxxxxx  # Your security group ID
   
   # Add Prometheus
   aws ec2 authorize-security-group-ingress \
     --group-id $SG_ID \
     --protocol tcp --port 9090 \
     --cidr 0.0.0.0/0
   
   # Add Grafana
   aws ec2 authorize-security-group-ingress \
     --group-id $SG_ID \
     --protocol tcp --port 3000 \
     --cidr 0.0.0.0/0
   ```

### Security Recommendations

⚠️ **IMPORTANT**: The above opens ports to the entire internet. For production:

1. **Restrict by IP:**
   ```
   Source: YOUR_IP/32  (instead of 0.0.0.0/0)
   ```

2. **Use HTTPS behind reverse proxy:**
   ```
   Nginx/ALB → Grafana port 3000 (internal)
   Enable SSL/TLS on reverse proxy
   ```

3. **Use VPN/Bastion Host:**
   ```
   Only allow access from VPN or bastion jump host
   ```

4. **Disable Prometheus public access:**
   ```
   Keep port 9090 closed to internet
   Access only from internal network or bastion
   ```

---

## 🚀 Deployment Instructions

### Prerequisites

- SSH access to EC2 instance
- EC2 Security Group configured (see above)
- Existing backend deployed (docker-compose running)

### Step 1: Prepare EC2

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@34.230.63.221

# Go to deployment directory
cd ~/movies-api

# List current files
ls -la
```

Expected to see:
```
docker-compose.yml
.env
Dockerfile
app/
requirements.txt
prometheus.yml        (NEW)
grafana/             (NEW)
scripts/             (NEW)
```

### Step 2: Update .env with Monitoring Variables

On your **local machine**, update the `.env` file:

```bash
cd backend

# Edit .env and add/update:
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=your_very_secure_password_here
```

Then copy to EC2:

```bash
scp -i your-key.pem .env ubuntu@34.230.63.221:~/movies-api/.env
```

Or manually via SSH:

```bash
ssh -i your-key.pem ubuntu@34.230.63.221 <<'EOF'
cat >> ~/movies-api/.env <<'VARS'

# Grafana Monitoring (added by deployment)
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=your_very_secure_password_here
VARS
EOF
```

### Step 3: Copy Monitoring Configuration to EC2

From your **local machine** in the `backend/` directory:

```bash
# Copy Prometheus config
scp -i your-key.pem prometheus.yml \
    ubuntu@34.230.63.221:~/movies-api/

# Copy Grafana provisioning directory
scp -r -i your-key.pem grafana/ \
    ubuntu@34.230.63.221:~/movies-api/

# Copy deployment scripts
scp -r -i your-key.pem scripts/ \
    ubuntu@34.230.63.221:~/movies-api/
```

Or use the automated script:

```bash
./scripts/deploy-monitoring.sh 34.230.63.221 ubuntu ~/.ssh/netflix-key.pem
```

### Step 4: Start Monitoring Services on EC2

```bash
ssh -i your-key.pem ubuntu@34.230.63.221 <<'EOF'
cd ~/movies-api

# Pull latest images
docker compose pull api prometheus grafana

# Start all services
docker compose up -d

# Wait for services to be healthy
sleep 15

# Verify
docker compose ps
EOF
```

Expected output:
```
NAME                STATUS           PORTS
movies_api          Up (healthy)     0.0.0.0:8000->8000/tcp
movies_prometheus   Up (healthy)     0.0.0.0:9090->9090/tcp
movies_grafana      Up (healthy)     0.0.0.0:3000->3000/tcp
```

---

## ✅ Verification

### Local Verification

Run the verification script from your local machine:

```bash
cd backend
./scripts/verify-monitoring.sh 34.230.63.221
```

Or manually verify each component:

#### 1. Backend Metrics Endpoint

```bash
curl http://34.230.63.221:8000/metrics | head -20
```

Expected: Prometheus format metrics starting with `# HELP`

#### 2. Prometheus Targets

```bash
curl http://34.230.63.221:9090/api/v1/targets | jq '.data.activeTargets'
```

Expected: Should show `movies-api` job with status `UP`

#### 3. Grafana Health

```bash
curl http://34.230.63.221:3000/api/health
```

Expected: Returns JSON with `ok: true`

### Browser Verification

1. **Open Grafana:**
   ```
   http://34.230.63.221:3000
   ```
   - Login: `admin` / (your password from .env)
   - Navigate to: Dashboards → Movies API Monitoring Dashboard
   - Should show metrics graphs

2. **Open Prometheus:**
   ```
   http://34.230.63.221:9090
   ```
   - Status → Targets
   - Should show `movies-api` as `UP`
   - Try query: `up{job="movies-api"}`

---

## 📊 Accessing Grafana

### Initial Access

```
URL: http://34.230.63.221:3000
Username: admin
Password: (value from GRAFANA_ADMIN_PASSWORD in .env)
```

### First Time Setup

1. Login with admin credentials
2. Navigate to **Dashboards** → **Movies API Monitoring Dashboard**
3. Wait ~30 seconds for metrics to populate
4. Generate test traffic to see live data:

```bash
./scripts/test-metrics.sh 34.230.63.221 20
```

### Dashboard Panels

The auto-provisioned dashboard includes:

1. **Request Rate** - Requests per second over time
2. **Request Latency** - p95 and p99 percentiles
3. **4xx Errors** - Client errors (5-minute average)
4. **5xx Errors** - Server errors (5-minute average)
5. **Backend Availability** - Up/Down status
6. **Total Requests** - Request count (5-minute)
7. **HTTP Status Distribution** - Breakdown by status code
8. **Average Duration** - Latency by endpoint path

### Dashboard Customization

To customize the dashboard:

1. In Grafana: Click **Edit** (pencil icon)
2. Modify panels as needed
3. Click **Save Dashboard**

Changes are persisted in the `grafana_data` volume.

---

## 🔧 Production Setup

### ⚠️ NOT RECOMMENDED FOR PRODUCTION

The current setup exposes Grafana and Prometheus directly to the internet. For production:

### Recommended Production Architecture

```
┌─────────────────┐
│  Your Browser   │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────────────────┐
│   Nginx/ALB Reverse Proxy   │
│   (SSL/TLS)                 │
│   Port 443 (public)         │
└────────┬────────────────────┘
         │ HTTP (internal)
         ▼
┌─────────────────────────────┐
│  Grafana Container          │
│  Port 3000 (internal only)  │
└─────────────────────────────┘
```

### Implementation Steps

1. **Set up Nginx reverse proxy:**
   ```yaml
   # Add to docker-compose.yml
   nginx:
     image: nginx:1.27-alpine
     ports:
       - "443:443"
     volumes:
       - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
       - ./nginx/certs:/etc/nginx/certs:ro
     depends_on:
       - grafana
   ```

2. **Restrict Grafana port in Security Group:**
   - Remove port 3000 from public access
   - Only allow from nginx/ALB

3. **Get SSL certificate:**
   - Use AWS ACM or Let's Encrypt
   - Configure in Nginx

4. **Disable Prometheus public access:**
   - Don't expose port 9090 to internet
   - Access only via internal network or bastion host

---

## 🔄 CI/CD Integration

The existing GitHub Actions workflow **requires no changes**. The monitoring stack is self-contained.

### To Deploy Monitoring via CI/CD

Add a new GitHub Secret and workflow job (optional):

```yaml
# In .github/workflows/deploy.yml, add new job:

deploy-monitoring:
  name: Deploy Monitoring Stack
  runs-on: ubuntu-latest
  needs: deploy  # runs after backend deployment
  steps:
    - uses: actions/checkout@v4
    - name: Deploy monitoring to EC2
      run: |
        # Similar to backend deployment but for monitoring files
        scp -i $SSH_KEY prometheus.yml ...
        scp -r -i $SSH_KEY grafana/ ...
        ssh -i $SSH_KEY "cd ~/movies-api && docker compose up -d prometheus grafana"
```

For now, deploy monitoring manually once, then it persists.

---

## 📦 Backup & Recovery

### Backup Data

```bash
# SSH to EC2
ssh -i your-key.pem ubuntu@34.230.63.221

# Backup Prometheus data
docker run --rm -v prometheus_data:/data -v $(pwd):/backup \
  busybox tar czf /backup/prometheus_backup.tar.gz -C /data .

# Backup Grafana data
docker run --rm -v grafana_data:/data -v $(pwd):/backup \
  busybox tar czf /backup/grafana_backup.tar.gz -C /data .

# Download to local machine
scp -i your-key.pem ubuntu@34.230.63.221:~/movies-api/*_backup.tar.gz .
```

### Restore from Backup

```bash
# SSH to EC2
ssh -i your-key.pem ubuntu@34.230.63.221

# Stop containers
docker compose down prometheus grafana

# Restore Prometheus
docker run --rm -v prometheus_data:/data -v $(pwd):/backup \
  busybox tar xzf /backup/prometheus_backup.tar.gz -C /data

# Restore Grafana
docker run --rm -v grafana_data:/data -v $(pwd):/backup \
  busybox tar xzf /backup/grafana_backup.tar.gz -C /data

# Restart
docker compose up -d prometheus grafana
```

---

## ❌ Troubleshooting

### Prometheus can't scrape metrics

**Problem:** Prometheus shows `DOWN` for backend target

**Solution:**
```bash
# Verify backend metrics endpoint works
curl http://34.230.63.221:8000/metrics

# Check Prometheus config
docker compose exec prometheus cat /etc/prometheus/prometheus.yml

# Check Prometheus logs
docker compose logs prometheus --tail 50

# Verify network connectivity from Prometheus container
docker compose exec prometheus curl http://api:8000/metrics
```

### Grafana won't start

**Problem:** Grafana status shows `unhealthy`

**Solution:**
```bash
# Check Grafana logs
docker compose logs grafana --tail 100

# Verify permissions on grafana_data volume
docker compose exec grafana ls -la /var/lib/grafana

# Restart Grafana
docker compose restart grafana

# Check if port 3000 is already in use
sudo lsof -i :3000
```

### No metrics visible in dashboard

**Problem:** Dashboard shows no data

**Solution:**
1. Wait 30-60 seconds (Prometheus needs time to scrape)
2. Generate test traffic: `./scripts/test-metrics.sh 34.230.63.221 20`
3. Check Prometheus directly: `http://34.230.63.221:9090/graph`
4. Query: `fastapi_requests_total` → Execute

### Out of disk space

**Problem:** Prometheus fills up disk

**Solution:**
```bash
# Reduce retention in docker-compose.yml
# Change: '--storage.tsdb.retention.time=30d'
# To: '--storage.tsdb.retention.time=7d'

# Restart Prometheus
docker compose restart prometheus

# Old data will be deleted automatically
```

---

## 📞 Support & Monitoring Alerts

### Setting Up Alerts (Advanced)

To add alerting, configure Alertmanager:

1. Add Alertmanager to docker-compose.yml
2. Configure alert rules in Prometheus
3. Set up notification channels (email, Slack, etc.)

See Prometheus documentation: https://prometheus.io/docs/alerting/latest/overview/

### Useful Queries

```promql
# Request rate
rate(fastapi_requests_total[1m])

# Error rate
rate(fastapi_requests_total{status=~"5.."}[5m])

# Backend availability
up{job="movies-api"}

# P95 latency
histogram_quantile(0.95, rate(fastapi_requests_duration_seconds_bucket[5m]))

# Request count
increase(fastapi_requests_total[5m])
```

---

## 📝 Summary

| Component   | Port | Status       | Notes                              |
|-------------|------|--------------|-----------------------------------|
| FastAPI     | 8000 | Already UP   | Metrics exposed at /metrics        |
| Prometheus  | 9090 | NEW          | Scrapes backend every 15s          |
| Grafana     | 3000 | NEW          | Auto-provisioned with dashboard    |

**✅ Your monitoring stack is now production-ready!**

Need help? Check:
1. `MONITORING_SETUP.md` - Quick start & verification
2. `./scripts/verify-monitoring.sh` - Automated health check
3. Prometheus logs: `docker compose logs prometheus`
4. Grafana logs: `docker compose logs grafana`
