from pydantic import BaseModel, UUID4
from typing import Optional
from datetime import datetime


class WatchProgressUpdate(BaseModel):
    movie_id: Optional[UUID4] = None
    show_id: Optional[UUID4] = None
    episode_id: Optional[UUID4] = None
    progress: int  # seconds
    duration: Optional[int] = None


class WatchHistoryResponse(BaseModel):
    id: UUID4
    movie_id: Optional[UUID4] = None
    show_id: Optional[UUID4] = None
    episode_id: Optional[UUID4] = None
    progress: int
    duration: Optional[int] = None
    completed: bool
    watched_at: datetime

    class Config:
        from_attributes = True


class WatchlistAdd(BaseModel):
    movie_id: Optional[UUID4] = None
    show_id: Optional[UUID4] = None


class WatchlistResponse(BaseModel):
    id: UUID4
    movie_id: Optional[UUID4] = None
    show_id: Optional[UUID4] = None
    added_at: datetime

    class Config:
        from_attributes = True


class RatingCreate(BaseModel):
    movie_id: Optional[UUID4] = None
    show_id: Optional[UUID4] = None
    score: float  # 1.0 - 10.0


class RatingResponse(BaseModel):
    id: UUID4
    user_id: UUID4
    movie_id: Optional[UUID4] = None
    show_id: Optional[UUID4] = None
    score: float
    created_at: datetime

    class Config:
        from_attributes = True


class ReviewCreate(BaseModel):
    movie_id: Optional[UUID4] = None
    show_id: Optional[UUID4] = None
    content: str
    is_spoiler: bool = False


class ReviewResponse(BaseModel):
    id: UUID4
    user_id: UUID4
    movie_id: Optional[UUID4] = None
    show_id: Optional[UUID4] = None
    content: str
    is_spoiler: bool
    likes: int
    created_at: datetime

    class Config:
        from_attributes = True
