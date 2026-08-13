#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  Fix Monitoring Setup on EC2
#
#  Usage:
#    ./scripts/fix-ec2-monitoring.sh 34.230.63.221 ubuntu ~/.ssh/netflix-key.pem
#
# ═══════════════════════════════════════════════════════════════

EC2_HOST=${1:-34.230.63.221}
EC2_USER=${2:-ubuntu}
SSH_KEY=${3:-~/.ssh/netflix-key.pem}
DEPLOY_DIR=~/movies-api

echo "🔧 Fixing monitoring setup on EC2..."
echo "   Host: $EC2_HOST"
echo ""

# ── SSH and fix ──────────────────────────────────────────────
ssh -i "$SSH_KEY" \
    -o StrictHostKeyChecking=no \
    "$EC2_USER@$EC2_HOST" <<'REMOTE_SCRIPT'

set -e
cd ~/movies-api

echo "1️⃣  Stopping containers..."
docker compose down prometheus grafana 2>/dev/null || true

echo "2️⃣  Removing stray prometheus.yml directory if it exists..."
rm -rf prometheus.yml/ 2>/dev/null || true

echo "3️⃣  Removing old grafana directory if it exists..."
rm -rf grafana/ 2>/dev/null || true

echo "4️⃣  Verifying permissions..."
ls -la | head -10

echo ""
echo "✅ Cleanup complete. Ready for fresh deployment."

REMOTE_SCRIPT

echo ""
echo "Now copy fresh files from your local machine:"
echo ""
echo "scp -i $SSH_KEY backend/prometheus.yml $EC2_USER@$EC2_HOST:$DEPLOY_DIR/"
echo "scp -r -i $SSH_KEY backend/grafana $EC2_USER@$EC2_HOST:$DEPLOY_DIR/"
echo ""
echo "Then restart: docker compose up -d prometheus grafana"
echo ""
