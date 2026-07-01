from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.repositories.content_repository import MovieRepository, ShowRepository, ActorRepository

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("/")
def search(
    q: str = Query(..., min_length=1),
    content_type: Optional[str] = Query(None, description="movies | shows | all"),
    genre: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    skip = (page - 1) * page_size
    results = {"movies": [], "shows": [], "actors": [], "query": q}

    if content_type in (None, "all", "movies"):
        movie_repo = MovieRepository(db)
        movies = movie_repo.search(q, skip=skip, limit=page_size)
        results["movies"] = [
            {
                "id": str(m.id),
                "title": m.title,
                "slug": m.slug,
                "thumbnail_url": m.thumbnail_url,
                "release_date": str(m.release_date) if m.release_date else None,
                "average_rating": m.average_rating,
                "type": "movie",
            }
            for m in movies
        ]

    if content_type in (None, "all", "shows"):
        show_repo = ShowRepository(db)
        shows = show_repo.search(q, skip=skip, limit=page_size)
        results["shows"] = [
            {
                "id": str(s.id),
                "title": s.title,
                "slug": s.slug,
                "thumbnail_url": s.thumbnail_url,
                "status": s.status,
                "average_rating": s.average_rating,
                "type": "show",
            }
            for s in shows
        ]

    if content_type in (None, "all"):
        actor_repo = ActorRepository(db)
        actors = actor_repo.search(q)
        results["actors"] = [
            {
                "id": str(a.id),
                "name": a.name,
                "photo_url": a.photo_url,
                "type": "actor",
            }
            for a in actors
        ]

    return results
