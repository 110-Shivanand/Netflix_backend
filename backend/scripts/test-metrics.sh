#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  Generate Test Traffic to Populate Metrics
#
#  Usage:
#    ./scripts/test-metrics.sh [HOST] [NUM_REQUESTS]
#
#  Example (Local, 20 requests):
#    ./scripts/test-metrics.sh localhost 20
#
#  Example (EC2, 50 requests):
#    ./scripts/test-metrics.sh 34.230.63.221 50
# ═══════════════════════════════════════════════════════════════

HOST=${1:-localhost}
NUM_REQUESTS=${2:-10}
API_PORT=8000
BASE_URL="http://$HOST:$API_PORT"

echo "🚀 Generating test traffic..."
echo "   Host: $HOST"
echo "   Requests: $NUM_REQUESTS"
echo "   Base URL: $BASE_URL"
echo ""

# ── Test health endpoint ─────────────────────────────────────
echo "✓ Testing /health endpoint..."
curl -s "$BASE_URL/health" | jq '.' && echo ""

# ── Generate search requests ─────────────────────────────────
echo "✓ Generating search requests..."
SEARCH_QUERIES=("action" "comedy" "drama" "thriller" "animation" "horror" "sci-fi" "romance" "family" "adventure")

for i in $(seq 1 $NUM_REQUESTS); do
    QUERY=${SEARCH_QUERIES[$((RANDOM % ${#SEARCH_QUERIES[@]}))]}
    PAGE=$((1 + RANDOM % 3))
    
    echo -n "  [$i/$NUM_REQUESTS] Searching '$QUERY' (page $PAGE)... "
    STATUS=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/movies?search=$QUERY&page=$PAGE")
    if [ "$STATUS" = "200" ]; then
        echo "✅"
    else
        echo "⚠️ ($STATUS)"
    fi
    sleep 0.5
done
echo ""

# ── Generate detail requests ─────────────────────────────────
echo "✓ Generating detail requests..."
IMDB_IDS=(
    "tt0120737"  # LOTR
    "tt0468569"  # Dark Knight
    "tt0816692"  # Interstellar
    "tt1375666"  # Inception
    "tt4154796"  # Avengers Endgame
    "tt6751668"  # Parasite
    "tt0111161"  # Shawshank Redemption
    "tt0068646"  # Godfather
    "tt1345836"  # Dark Knight Rises
    "tt1375666"  # Inception (repeat)
)

for i in $(seq 1 $((NUM_REQUESTS / 2))); do
    ID=${IMDB_IDS[$((RANDOM % ${#IMDB_IDS[@]}))]}
    
    echo -n "  [$i/$((NUM_REQUESTS / 2))] Fetching detail for $ID... "
    STATUS=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/movies/$ID")
    if [ "$STATUS" = "200" ]; then
        echo "✅"
    else
        echo "⚠️ ($STATUS)"
    fi
    sleep 0.5
done
echo ""

# ── Summary ──────────────────────────────────────────────────
echo "════════════════════════════════════════════════════════════"
echo "✅ Test traffic generated!"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "📊 Metrics should now be populated in Prometheus/Grafana"
echo ""
echo "🔗 View metrics:"
echo "   Prometheus:      http://$HOST:9090"
echo "   Grafana:         http://$HOST:3000"
echo "   Raw metrics:     http://$HOST:$API_PORT/metrics"
echo ""
echo "💡 Tip: Wait 15-30 seconds for Prometheus to scrape the metrics"
echo ""
