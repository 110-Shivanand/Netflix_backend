# Monitoring Implementation Checklist

## Pre-Deployment

- [ ] Read `MONITORING_SUMMARY.md` for overview
- [ ] Review `MONITORING_DEPLOYMENT.md` for security requirements
- [ ] Ensure SSH access to EC2 instance works
- [ ] Verify EC2 security group can be modified

## Local Testing (Optional but Recommended)

- [ ] Run `docker compose up -d` in backend folder
- [ ] Verify all 3 containers are healthy: `docker compose ps`
- [ ] Access Grafana: http://localhost:3000 (admin/admin)
- [ ] Access Prometheus: http://localhost:9090
- [ ] Run test script: `./scripts/test-metrics.sh localhost 10`
- [ ] See metrics in Grafana dashboard
- [ ] All systems working → Ready for EC2

## AWS Security Group Configuration

- [ ] Note your EC2 Security Group ID
- [ ] Add inbound rule: Port 9090 (Prometheus) from your IP
- [ ] Add inbound rule: Port 3000 (Grafana) from your IP
- [ ] Verify rules applied (may take 1-2 minutes)

## EC2 Deployment

### Copy Files to EC2

- [ ] Copy `prometheus.yml` to EC2: `~/movies-api/`
- [ ] Copy `grafana/` directory to EC2: `~/movies-api/`
- [ ] Copy `scripts/` directory to EC2: `~/movies-api/` (optional but recommended)

**Using Script (Recommended):**
```bash
cd backend
./scripts/deploy-monitoring.sh 34.230.63.221 ubuntu ~/.ssh/netflix-key.pem
```

**Manual Method:**
```bash
scp -i your-key.pem prometheus.yml ubuntu@34.230.63.221:~/movies-api/
scp -r -i your-key.pem grafana/ ubuntu@34.230.63.221:~/movies-api/
scp -r -i your-key.pem scripts/ ubuntu@34.230.63.221:~/movies-api/
```

### Update .env on EC2

- [ ] SSH to EC2
- [ ] Edit `~/movies-api/.env`
- [ ] Add Grafana credentials:
  ```
  GRAFANA_ADMIN_USER=admin
  GRAFANA_ADMIN_PASSWORD=your_secure_password
  ```
- [ ] Save file

### Start Services

- [ ] SSH to EC2
- [ ] Navigate to: `cd ~/movies-api`
- [ ] Pull latest images: `docker compose pull`
- [ ] Start services: `docker compose up -d`
- [ ] Wait 15 seconds for services to start
- [ ] Check status: `docker compose ps`

## Post-Deployment Verification

### Quick Health Check

```bash
./scripts/verify-monitoring.sh 34.230.63.221
```

- [ ] Backend health endpoint: ✅
- [ ] Backend metrics endpoint: ✅
- [ ] Prometheus health: ✅
- [ ] Prometheus targets: ✅ (movies-api = UP)
- [ ] Grafana health: ✅
- [ ] Grafana datasources: ✅ (Prometheus)
- [ ] Grafana dashboards: ✅ (Movies API Dashboard)

### Manual Verification Steps

- [ ] Backend metrics reachable:
  ```bash
  curl http://34.230.63.221:8000/metrics | head -5
  # Should see HELP comments
  ```

- [ ] Prometheus can scrape backend:
  ```bash
  curl http://34.230.63.221:9090/api/v1/targets | jq '.data.activeTargets[0].health'
  # Should return "up"
  ```

- [ ] Grafana has Prometheus datasource:
  ```bash
  curl -u admin:admin http://34.230.63.221:3000/api/datasources | jq '.[] | .name'
  # Should return "Prometheus"
  ```

- [ ] Dashboard is auto-provisioned:
  ```bash
  curl -u admin:admin http://34.230.63.221:3000/api/search | jq '.[] | .title'
  # Should return "Movies API Monitoring Dashboard"
  ```

### Browser Verification

- [ ] Grafana loads: http://34.230.63.221:3000
- [ ] Can login with admin credentials
- [ ] Dashboard exists: Dashboards → Movies API Monitoring Dashboard
- [ ] Dashboard loads without errors
- [ ] Panels are visible (may show "no data" initially)
- [ ] Prometheus loads: http://34.230.63.221:9090
- [ ] Targets show movies-api as UP

## Generate Test Metrics

- [ ] Run test traffic script:
  ```bash
  ./scripts/test-metrics.sh 34.230.63.221 20
  ```

- [ ] Wait 30-45 seconds for Prometheus to scrape

- [ ] Refresh Grafana dashboard

- [ ] Verify metrics appear:
  - [ ] Request Rate graph has data
  - [ ] Latency graph has data
  - [ ] Status codes show breakdown
  - [ ] Availability shows UP
  - [ ] Other panels populated

## Update CI/CD (Optional)

- [ ] Review `.github/workflows/deploy.yml` - No changes required
- [ ] Monitoring deployment is independent of API deployment
- [ ] Can deploy backend without redeploying monitoring

## Production Hardening (Recommended)

- [ ] Change Grafana admin password to strong value
- [ ] Update Security Group to restrict IPs (not 0.0.0.0/0)
- [ ] Set up Nginx reverse proxy for HTTPS (optional but recommended)
- [ ] Document access procedures for team
- [ ] Set up backup cron job for volumes
- [ ] Configure alert rules for critical metrics

## Documentation

- [ ] Share access details with team
- [ ] Document backup procedures
- [ ] Document alert thresholds
- [ ] Create runbook for common issues

## Monitoring Going Forward

### Weekly
- [ ] Check Grafana dashboard for anomalies
- [ ] Review error rates and latency
- [ ] Verify Prometheus target health

### Monthly
- [ ] Backup Prometheus and Grafana data
- [ ] Review and clean up old dashboards
- [ ] Update alert rules if needed
- [ ] Check disk usage trends

### As Needed
- [ ] Add new panels to dashboard
- [ ] Configure additional alerts
- [ ] Troubleshoot performance issues
- [ ] Scale monitoring infrastructure

---

## Rollback (If Needed)

If something goes wrong:

```bash
# SSH to EC2
ssh -i your-key.pem ubuntu@34.230.63.221

# Stop monitoring services (API continues running)
docker compose stop prometheus grafana

# Remove monitoring containers
docker compose rm -f prometheus grafana

# Remove volumes (WARNING: data loss)
docker volume rm prometheus_data grafana_data

# Restart just the API
docker compose up -d api
```

The API will continue working fine without monitoring.

---

## Support

For issues during deployment, check:

1. **Logs:**
   ```bash
   docker compose logs prometheus --tail 50
   docker compose logs grafana --tail 50
   docker compose logs api --tail 50
   ```

2. **Connectivity:**
   ```bash
   docker compose exec prometheus curl http://api:8000/metrics
   docker compose exec grafana curl http://prometheus:9090
   ```

3. **Documentation:**
   - `MONITORING_DEPLOYMENT.md` - Troubleshooting section
   - `MONITORING_SETUP.md` - FAQ and common issues

---

## Sign-Off

- [ ] Deployment completed successfully
- [ ] All verification steps passed
- [ ] Team trained on access and usage
- [ ] Backup procedures documented
- [ ] Alert thresholds configured
- [ ] Ready for production monitoring

**Date Completed:** ________________

**Deployed By:** ________________

**Verified By:** ________________

---

**Next:** Monitor your API with Grafana! 🚀📊
