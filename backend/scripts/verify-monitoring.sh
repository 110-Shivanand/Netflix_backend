#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  Verify Monitoring Stack Health
#
#  Usage:
#    ./scripts/verify-monitoring.sh [HOST]
#
#  Example (Local):
#    ./scripts/verify-monitoring.sh localhost
#
#  Example (EC2):
#    ./scripts/verify-monitoring.sh 34.230.63.221
# ═══════════════════════════════════════════════════════════════

HOST=${1:-localhost}
API_PORT=8000
PROM_PORT=9090
GRAFANA_PORT=3000

echo "🔍 Verifying monitoring stack on $HOST..."
echo ""

# ── Check Backend ────────────────────────────────────────────
echo "1️⃣  Backend API ($HOST:$API_PORT)"
echo "   Testing health endpoint..."
if curl -s http://$HOST:$API_PORT/health | jq '.' >/dev/null 2>&1; then
    echo "   ✅ Health endpoint: OK"
else
    echo "   ❌ Health endpoint: FAILED"
fi

echo "   Testing metrics endpoint..."
if curl -s http://$HOST:$API_PORT/metrics | head -1 | grep -q "HELP"; then
    echo "   ✅ Metrics endpoint: OK"
    echo "   Sample metrics:"
    curl -s http://$HOST:$API_PORT/metrics | grep "fastapi_requests" | head -3
else
    echo "   ❌ Metrics endpoint: FAILED"
fi
echo ""

# ── Check Prometheus ─────────────────────────────────────────
echo "2️⃣  Prometheus ($HOST:$PROM_PORT)"
echo "   Testing health endpoint..."
if curl -s http://$HOST:$PROM_PORT/-/healthy | grep -q "Prometheus Server is Ready"; then
    echo "   ✅ Prometheus: HEALTHY"
else
    echo "   ❌ Prometheus: UNHEALTHY"
fi

echo "   Checking scrape targets..."
TARGETS=$(curl -s http://$HOST:$PROM_PORT/api/v1/targets 2>/dev/null | jq '.data.activeTargets | length' 2>/dev/null || echo "0")
echo "   Active targets: $TARGETS"

if [ "$TARGETS" -gt 0 ]; then
    echo "   Target details:"
    curl -s http://$HOST:$PROM_PORT/api/v1/targets 2>/dev/null | \
        jq '.data.activeTargets[] | "\(.labels.job) - \(.labels.instance) - \(.health)"' 2>/dev/null || echo "   (Could not fetch details)"
fi
echo ""

# ── Check Grafana ────────────────────────────────────────────
echo "3️⃣  Grafana ($HOST:$GRAFANA_PORT)"
echo "   Testing health endpoint..."
if curl -s http://$HOST:$GRAFANA_PORT/api/health | jq '.' >/dev/null 2>&1; then
    echo "   ✅ Grafana: HEALTHY"
else
    echo "   ❌ Grafana: UNHEALTHY"
fi

echo "   Checking datasources..."
DATASOURCES=$(curl -s -u admin:admin http://$HOST:$GRAFANA_PORT/api/datasources 2>/dev/null | jq 'length' 2>/dev/null || echo "0")
echo "   Datasources found: $DATASOURCES"

if [ "$DATASOURCES" -gt 0 ]; then
    echo "   Datasource details:"
    curl -s -u admin:admin http://$HOST:$GRAFANA_PORT/api/datasources 2>/dev/null | \
        jq '.[] | "\(.name) (\(.type)) - \(.url)"' 2>/dev/null || echo "   (Could not fetch details)"
fi

echo "   Checking dashboards..."
DASHBOARDS=$(curl -s -u admin:admin http://$HOST:$GRAFANA_PORT/api/search 2>/dev/null | jq 'length' 2>/dev/null || echo "0")
echo "   Dashboards found: $DASHBOARDS"

if [ "$DASHBOARDS" -gt 0 ]; then
    echo "   Dashboard titles:"
    curl -s -u admin:admin http://$HOST:$GRAFANA_PORT/api/search 2>/dev/null | \
        jq '.[] | "\(.title)"' 2>/dev/null || echo "   (Could not fetch details)"
fi
echo ""

# ── Summary ──────────────────────────────────────────────────
echo "════════════════════════════════════════════════════════════"
echo "📊 Monitoring Summary:"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "🔗 Access URLs:"
echo "   Grafana:    http://$HOST:$GRAFANA_PORT"
echo "   Prometheus: http://$HOST:$PROM_PORT"
echo "   Metrics:    http://$HOST:$API_PORT/metrics"
echo ""
echo "🔑 Grafana Login:"
echo "   Username: admin"
echo "   Password: (check .env GRAFANA_ADMIN_PASSWORD)"
echo ""
echo "✨ Next steps:"
echo "   1. Open Grafana in browser"
echo "   2. Check Movies API Monitoring Dashboard"
echo "   3. Generate test traffic to populate metrics"
echo "   4. Review alerts and SLOs"
echo ""
