# ═══════════════════════════════════════════════════════════════
#  Multi-stage production Dockerfile — FastAPI / Movies API
# ═══════════════════════════════════════════════════════════════

# ── Stage 1: dependency builder ─────────────────────────────
FROM python:3.11-slim AS builder

# Keep Python from writing .pyc files and buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /build

# Install only what's needed to build wheels
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy and install dependencies into an isolated prefix
COPY requirements.txt .
RUN pip install --upgrade pip \
 && pip install --prefix=/install --no-cache-dir -r requirements.txt


# ── Stage 2: production runtime ─────────────────────────────
FROM python:3.11-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    # tell uvicorn / httpx to trust proxy headers
    FORWARDED_ALLOW_IPS="*"

# Non-root user for security
RUN groupadd --gid 1001 appgroup \
 && useradd  --uid 1001 --gid appgroup --no-create-home appuser

WORKDIR /app

# Pull compiled packages from builder
COPY --from=builder /install /usr/local

# Copy application source
COPY app/ ./app/

# Drop privileges
USER appuser

# Expose the port uvicorn will bind to
EXPOSE 8000

# Health-check — Docker will mark the container unhealthy if this fails
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" \
    || exit 1

# Production server:
#   - 4 workers (tune via WORKERS env var)
#   - Access log to stdout
#   - No --reload in production
CMD ["sh", "-c", \
     "uvicorn app.main:app \
        --host 0.0.0.0 \
        --port 8000 \
        --workers ${WORKERS:-4} \
        --proxy-headers \
        --access-log"]
