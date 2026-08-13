# Monitoring Quick Reference Card

## 🚀 Deploy in 2 Commands

```bash
# From backend/ directory
./scripts/deploy-monitoring.sh 34.230.63.221 ubuntu ~/.ssh/netflix-key.pem
./scripts/verify-monitoring.sh 34.230.63.221
```

## 🌐 Access URLs

```
Grafana:    http://34.230.63.221:3000
Prometheus: http://34.230.63.221:9090
Metrics:    http://34.230.63.221:8000/metrics
```

## 🔑 Credentials

```
Username: admin
Password: (from .env - GRAFANA_ADMIN_PASSWORD)
```

## 📊 Dashboard Panels

1. Request Rate (requests/sec)
2. Latency (p95/p99)
3. 4xx Errors
4. 5xx Errors
5. Availability (up/down)
6. Total Requests (5-min)
7. Status Distribution
8. Duration by Path

## ✅ Verify All Working

```bash
# Backend metrics
curl http://34.230.63.221:8000/metrics | head -5

# Prometheus targets
curl http://34.230.63.221:9090/api/v1/targets | jq '.data.activeTargets[0].health'

# Grafana health
curl -u admin:admin http://34.230.63.221:3000/api/health
```

Expected: `up`, `ok`, `ok`

## 🧪 Generate Test Traffic

```bash
./scripts/test-metrics.sh 34.230.63.221 20
```

Then wait 30 seconds and refresh Grafana.

## 🔍 View Logs

```bash
docker compose logs prometheus --tail 50
docker compose logs grafana --tail 50
docker compose logs api --tail 50
```

## 🛑 Stop Services

```bash
docker compose stop prometheus grafana
```

## 🔄 Restart Services

```bash
docker compose restart prometheus grafana
```

## 📁 Key Files

```
prometheus.yml                  Scrape config
docker-compose.yml             Container setup
grafana/provisioning/          Auto-provisioning
scripts/                       Deployment tools
MONITORING_*.md               Documentation
```

## 🔒 AWS Security Group

Add inbound rules:
- Port 3000 → Grafana
- Port 9090 → Prometheus (optional)

## ⚠️ Important

- Change Grafana password after first login
- Restrict Security Group to your IP
- Use HTTPS reverse proxy for production
- Keep Prometheus internal

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| No metrics | Wait 30s, generate test traffic |
| Can't connect | Check Security Group rules |
| Prometheus DOWN | Verify `prometheus.yml` config |
| Full disk | Reduce retention time |

## 📖 Full Docs

- `MONITORING_INDEX.md` - Navigation
- `MONITORING_DEPLOYMENT.md` - Full guide
- `MONITORING_SETUP.md` - Local dev
- `MONITORING_CHECKLIST.md` - Deployment checklist

## 🚀 First Time Setup

1. Configure AWS Security Group (5 min)
2. Run deploy script (5 min)
3. Login to Grafana (2 min)
4. Generate test traffic (2 min)
5. View dashboard (1 min)

**Total: 15 minutes**

---

**That's it! Happy monitoring! 📊**
