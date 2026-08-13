#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  Deploy Monitoring Stack to EC2
#
#  Usage:
#    ./scripts/deploy-monitoring.sh <EC2_HOST> <EC2_USER> <SSH_KEY>
#
#  Example:
#    ./scripts/deploy-monitoring.sh 34.230.63.221 ubuntu ~/.ssh/netflix-key.pem
# ═══════════════════════════════════════════════════════════════

set -e

EC2_HOST=${1:-34.230.63.221}
EC2_USER=${2:-ubuntu}
SSH_KEY=${3:-~/.ssh/netflix-key.pem}
DEPLOY_DIR=~/movies-api

echo "🚀 Deploying monitoring stack to EC2..."
echo "   Host: $EC2_HOST"
echo "   User: $EC2_USER"
echo "   SSH Key: $SSH_KEY"
echo ""

# ── Verify SSH key exists ────────────────────────────────────
if [ ! -f "$SSH_KEY" ]; then
    echo "❌ SSH key not found: $SSH_KEY"
    exit 1
fi

# ── Copy prometheus.yml to EC2 ───────────────────────────────
echo "📋 Copying prometheus.yml..."
scp -i "$SSH_KEY" \
    -o StrictHostKeyChecking=no \
    prometheus.yml \
    "$EC2_USER@$EC2_HOST:$DEPLOY_DIR/prometheus.yml"

# ── Copy grafana provisioning files ──────────────────────────
echo "📋 Copying Grafana provisioning files..."
scp -r -i "$SSH_KEY" \
    -o StrictHostKeyChecking=no \
    grafana/ \
    "$EC2_USER@$EC2_HOST:$DEPLOY_DIR/"

# ── SSH and deploy ──────────────────────────────────────────
echo "🔧 Deploying containers..."
ssh -i "$SSH_KEY" \
    -o StrictHostKeyChecking=no \
    "$EC2_USER@$EC2_HOST" <<'REMOTE_SCRIPT'

set -e
cd ~/movies-api

echo "── Pulling latest images ──"
docker compose pull api prometheus grafana

echo "── Starting services ──"
docker compose up -d api prometheus grafana

echo "── Waiting for services to become healthy ──"
sleep 10

echo "── Container status ──"
docker compose ps

echo "── Health checks ──"
echo "Backend health:"
curl -s http://localhost:8000/health | jq '.' || echo "Backend not ready yet"

echo ""
echo "Prometheus health:"
curl -s http://localhost:9090/-/healthy || echo "Prometheus not ready yet"

echo ""
echo "Grafana health:"
curl -s http://localhost:3000/api/health || echo "Grafana not ready yet"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Access monitoring:"
echo "   Grafana:    http://$(hostname -I | awk '{print $1}'):3000"
echo "   Prometheus: http://$(hostname -I | awk '{print $1}'):9090"

REMOTE_SCRIPT

echo ""
echo "✅ Monitoring stack deployed successfully!"
echo ""
echo "🌐 Public endpoints:"
echo "   Grafana:    http://$EC2_HOST:3000"
echo "   Prometheus: http://$EC2_HOST:9090"
echo ""
echo "🔑 Grafana login:"
echo "   Username: admin"
echo "   Password: Check your .env file (GRAFANA_ADMIN_PASSWORD)"
