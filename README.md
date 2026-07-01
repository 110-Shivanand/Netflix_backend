# Netflix Clone

A production-ready Netflix Clone built with **React JS**, **FastAPI**, and **PostgreSQL**.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React JS, Tailwind CSS, React Router, Axios, Video.js |
| Backend | FastAPI, SQLAlchemy, Alembic, Pydantic, JWT |
| Database | PostgreSQL |
| Cache | Redis |
| Storage | MinIO (S3-compatible) |
| Proxy | Nginx |
| Containers | Docker + Docker Compose |

## Features

- JWT auth with refresh tokens, email verification, password reset
- Browse movies & TV shows with genre filtering and pagination
- Video streaming with byte-range support (seek/resume)
- Watch progress tracking & Continue Watching
- Watchlist, ratings (1–10), and reviews
- Content-based recommendation engine
- Full-text search across movies, shows, actors
- Admin panel: manage movies, shows, seasons, episodes, genres, users
- File uploads: thumbnails, banners, videos → stored in MinIO

---

## Quick Start (Docker)

```bash
# 1. Clone and enter the project
cd Netflix

# 2. Configure environment (edit emails/secrets)
#    backend/.env  — set SECRET_KEY, SMTP credentials
#    frontend/.env — already set for local dev

# 3. Build and start all services
docker-compose up --build

# 4. Seed initial data (admin user + genres)
docker exec -it netflix_backend python -m app.utils.seed
```

### Access

| Service | URL |
|---------|-----|
| App (via Nginx) | http://localhost |
| Frontend direct | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| MinIO Console | http://localhost:9001 |

### Default Admin Credentials

```
Email:    admin@netflix.com
Password: Admin@123456
```

> **Change these immediately in production.**

---

## Local Development (without Docker)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt

# Start PostgreSQL and Redis locally, then:
alembic upgrade head
python -m app.utils.seed
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install --legacy-peer-deps
npm start
```

---

## Environment Variables

### Backend `.env`

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | JWT signing key (change this) |
| `SMTP_USERNAME` | Gmail address for sending emails |
| `SMTP_PASSWORD` | Gmail App Password |
| `MINIO_ENDPOINT` | MinIO host:port |

### Frontend `.env`

| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | Backend API base URL |
| `REACT_APP_STREAM_URL` | Video streaming base URL |

---

## Project Structure

```
Netflix/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/    # Route handlers
│   │   ├── models/              # SQLAlchemy models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── services/            # Business logic
│   │   ├── repositories/        # Data access layer
│   │   ├── middleware/          # Auth dependencies
│   │   ├── core/                # Config, DB, Security
│   │   └── utils/               # Helpers, seeder
│   ├── alembic/                 # Migrations
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/                 # Axios clients
│   │   ├── components/          # Reusable UI
│   │   ├── context/             # React Context
│   │   ├── hooks/               # Custom hooks
│   │   ├── layouts/             # Page layouts
│   │   ├── pages/               # Route pages
│   │   └── routes/              # Route guards
│   └── Dockerfile
├── nginx/
│   └── nginx.conf
└── docker-compose.yml
```

---

## API Endpoints (key routes)

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
GET    /api/v1/movies/trending
GET    /api/v1/movies/featured
GET    /api/v1/movies/{slug}
GET    /api/v1/stream/movie/{id}       ← video streaming
POST   /api/v1/interactions/watchlist
POST   /api/v1/interactions/rate
GET    /api/v1/search?q=...
GET    /api/v1/recommendations
```

Full interactive docs at `http://localhost:8000/docs`
