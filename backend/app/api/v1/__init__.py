from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, users, movies, shows, stream,
    interactions, search, genres, recommendations,
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(movies.router)
api_router.include_router(shows.router)
api_router.include_router(stream.router)
api_router.include_router(interactions.router)
api_router.include_router(search.router)
api_router.include_router(genres.router)
api_router.include_router(recommendations.router)
