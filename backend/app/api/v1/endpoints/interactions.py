from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.repositories.interaction_repository import (
    WatchHistoryRepository, WatchlistRepository, RatingRepository, ReviewRepository
)
from app.repositories.content_repository import MovieRepository, ShowRepository
from app.schemas.interaction import (
    WatchProgressUpdate, WatchHistoryResponse,
    WatchlistAdd, WatchlistResponse,
    RatingCreate, RatingResponse,
    ReviewCreate, ReviewResponse,
)
from app.models.user import User

router = APIRouter(prefix="/interactions", tags=["Interactions"])


# ---- Watch Progress ----

@router.post("/watch-progress")
def update_watch_progress(
    data: WatchProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    repo = WatchHistoryRepository(db)
    entry = repo.upsert(
        user_id=current_user.id,
        progress=data.progress,
        duration=data.duration,
        movie_id=data.movie_id,
        show_id=data.show_id,
        episode_id=data.episode_id,
    )
    return {"message": "Progress saved", "progress": entry.progress}


@router.get("/watch-history", response_model=List[WatchHistoryResponse])
def get_watch_history(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    repo = WatchHistoryRepository(db)
    return repo.get_user_history(current_user.id, skip=skip, limit=limit)


@router.get("/continue-watching", response_model=List[WatchHistoryResponse])
def continue_watching(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    repo = WatchHistoryRepository(db)
    return repo.get_continue_watching(current_user.id)


# ---- Watchlist ----

@router.post("/watchlist")
def add_to_watchlist(
    data: WatchlistAdd,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not data.movie_id and not data.show_id:
        raise HTTPException(status_code=400, detail="movie_id or show_id required")
    repo = WatchlistRepository(db)
    existing = repo.get_entry(current_user.id, movie_id=data.movie_id, show_id=data.show_id)
    if existing:
        raise HTTPException(status_code=400, detail="Already in watchlist")
    repo.add(current_user.id, movie_id=data.movie_id, show_id=data.show_id)
    return {"message": "Added to watchlist"}


@router.delete("/watchlist")
def remove_from_watchlist(
    movie_id: Optional[str] = Query(None),
    show_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    repo = WatchlistRepository(db)
    entry = repo.get_entry(current_user.id, movie_id=movie_id, show_id=show_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Not in watchlist")
    repo.remove(entry)
    return {"message": "Removed from watchlist"}


@router.get("/watchlist", response_model=List[WatchlistResponse])
def get_watchlist(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    repo = WatchlistRepository(db)
    return repo.get_user_watchlist(current_user.id, skip=skip, limit=limit)


# ---- Ratings ----

@router.post("/rate", response_model=RatingResponse)
def rate_content(
    data: RatingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.score < 1 or data.score > 10:
        raise HTTPException(status_code=400, detail="Score must be between 1 and 10")
    repo = RatingRepository(db)
    rating = repo.create_or_update(
        current_user.id, data.score,
        movie_id=data.movie_id, show_id=data.show_id,
    )

    # Update content average
    avg = repo.get_average(movie_id=data.movie_id, show_id=data.show_id)
    if data.movie_id:
        MovieRepository(db).update_rating(data.movie_id, avg)
    elif data.show_id:
        from app.repositories.content_repository import ShowRepository
        show = ShowRepository(db).get_by_id(data.show_id)
        if show:
            show.average_rating = avg
            db.commit()

    return rating


# ---- Reviews ----

@router.post("/reviews", response_model=ReviewResponse, status_code=201)
def create_review(
    data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    repo = ReviewRepository(db)
    return repo.create(
        user_id=current_user.id,
        content=data.content,
        is_spoiler=data.is_spoiler,
        movie_id=data.movie_id,
        show_id=data.show_id,
    )


@router.get("/reviews")
def get_reviews(
    movie_id: Optional[str] = Query(None),
    show_id: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    repo = ReviewRepository(db)
    return repo.get_by_content(movie_id=movie_id, show_id=show_id, skip=skip, limit=limit)


@router.delete("/reviews/{review_id}")
def delete_review(
    review_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.models.interaction import Review
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if str(review.user_id) != str(current_user.id) and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    ReviewRepository(db).delete(review)
    return {"message": "Review deleted"}
