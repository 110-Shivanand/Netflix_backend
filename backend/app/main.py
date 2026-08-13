import os
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import httpx
from prometheus_fastapi_instrumentator import Instrumentator

load_dotenv()

# ── Config ───────────────────────────────────────────────────
APP_NAME      = os.getenv("APP_NAME",      "Movies API")
ENVIRONMENT   = os.getenv("ENVIRONMENT",   "development")
OMDB_API_KEY  = os.getenv("OMDB_API_KEY",  "")
OMDB_BASE_URL = os.getenv("OMDB_BASE_URL", "http://www.omdbapi.com/")
_origins_raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
ALLOWED_ORIGINS = ["*"] if _origins_raw.strip() == "*" else [
    o.strip() for o in _origins_raw.split(",") if o.strip()
]

# ── App ──────────────────────────────────────────────────────
app = FastAPI(
    title=APP_NAME,
    version="1.0.0",
    docs_url="/docs" if ENVIRONMENT == "development" else None,
    redoc_url="/redoc" if ENVIRONMENT == "development" else None,
)

# ── CORS Middleware ──────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=ALLOWED_ORIGINS != ["*"],  # can't use credentials with wildcard
    allow_methods=["GET"],
    allow_headers=["*"],
)

# ── Prometheus Metrics ───────────────────────────────────────
# Exposes metrics at /metrics endpoint
Instrumentator().instrument(app).expose(app)


# ── Routes ───────────────────────────────────────────────────
@app.get("/movies", summary="Search movies by title")
async def get_movies(
    search: str = Query(..., description="Movie title to search for"),
    page:   int = Query(1, ge=1, description="Page number (10 results per page)"),
):
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(
            OMDB_BASE_URL,
            params={"apikey": OMDB_API_KEY, "s": search, "page": page, "type": "movie"},
        )
        data = response.json()

    if data.get("Response") == "False":
        return {"movies": [], "total_results": 0, "page": page, "error": data.get("Error")}

    return {
        "movies":        data.get("Search", []),
        "total_results": int(data.get("totalResults", 0)),
        "page":          page,
    }


@app.get("/movies/{imdb_id}", summary="Get full movie details by IMDb ID")
async def get_movie_detail(imdb_id: str):
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(
            OMDB_BASE_URL,
            params={"apikey": OMDB_API_KEY, "i": imdb_id, "plot": "full"},
        )
        data = response.json()

    if data.get("Response") == "False":
        return {"error": data.get("Error")}

    return data


@app.get("/health", summary="Health check")
def health():
    return {"status": "ok", "app": APP_NAME, "environment": ENVIRONMENT}

