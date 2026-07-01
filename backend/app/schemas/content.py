from pydantic import BaseModel, UUID4
from typing import Optional, List
from datetime import datetime, date


# Genre
class GenreCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None


class GenreResponse(BaseModel):
    id: UUID4
    name: str
    slug: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


# Actor
class ActorCreate(BaseModel):
    name: str
    bio: Optional[str] = None
    birth_date: Optional[date] = None
    nationality: Optional[str] = None


class ActorResponse(BaseModel):
    id: UUID4
    name: str
    photo_url: Optional[str] = None
    bio: Optional[str] = None
    nationality: Optional[str] = None

    class Config:
        from_attributes = True


# Movie
class MovieCreate(BaseModel):
    title: str
    slug: str
    description: Optional[str] = None
    release_date: Optional[date] = None
    duration: Optional[int] = None
    language: Optional[str] = None
    country: Optional[str] = None
    maturity_rating: Optional[str] = None
    imdb_rating: Optional[float] = None
    is_featured: bool = False
    is_trending: bool = False
    is_new_release: bool = False
    genre_ids: Optional[List[UUID4]] = []
    actor_ids: Optional[List[UUID4]] = []


class MovieUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    release_date: Optional[date] = None
    duration: Optional[int] = None
    language: Optional[str] = None
    maturity_rating: Optional[str] = None
    imdb_rating: Optional[float] = None
    is_featured: Optional[bool] = None
    is_trending: Optional[bool] = None
    is_new_release: Optional[bool] = None
    genre_ids: Optional[List[UUID4]] = None
    actor_ids: Optional[List[UUID4]] = None


class MovieResponse(BaseModel):
    id: UUID4
    title: str
    slug: str
    description: Optional[str] = None
    release_date: Optional[date] = None
    duration: Optional[int] = None
    language: Optional[str] = None
    maturity_rating: Optional[str] = None
    imdb_rating: Optional[float] = None
    average_rating: float
    view_count: int
    is_featured: bool
    is_trending: bool
    is_new_release: bool
    thumbnail_url: Optional[str] = None
    banner_url: Optional[str] = None
    trailer_url: Optional[str] = None
    genres: List[GenreResponse] = []
    actors: List[ActorResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True


# Show
class ShowCreate(BaseModel):
    title: str
    slug: str
    description: Optional[str] = None
    first_air_date: Optional[date] = None
    language: Optional[str] = None
    country: Optional[str] = None
    maturity_rating: Optional[str] = None
    imdb_rating: Optional[float] = None
    is_featured: bool = False
    is_trending: bool = False
    genre_ids: Optional[List[UUID4]] = []
    actor_ids: Optional[List[UUID4]] = []


class ShowUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    language: Optional[str] = None
    maturity_rating: Optional[str] = None
    is_featured: Optional[bool] = None
    is_trending: Optional[bool] = None
    status: Optional[str] = None
    genre_ids: Optional[List[UUID4]] = None
    actor_ids: Optional[List[UUID4]] = None


class ShowResponse(BaseModel):
    id: UUID4
    title: str
    slug: str
    description: Optional[str] = None
    first_air_date: Optional[date] = None
    language: Optional[str] = None
    maturity_rating: Optional[str] = None
    imdb_rating: Optional[float] = None
    average_rating: float
    view_count: int
    is_featured: bool
    is_trending: bool
    status: str
    thumbnail_url: Optional[str] = None
    banner_url: Optional[str] = None
    genres: List[GenreResponse] = []
    actors: List[ActorResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True


# Season
class SeasonCreate(BaseModel):
    show_id: UUID4
    season_number: int
    title: Optional[str] = None
    description: Optional[str] = None
    air_date: Optional[date] = None


class SeasonResponse(BaseModel):
    id: UUID4
    show_id: UUID4
    season_number: int
    title: Optional[str] = None
    description: Optional[str] = None
    air_date: Optional[date] = None
    thumbnail_url: Optional[str] = None

    class Config:
        from_attributes = True


# Episode
class EpisodeCreate(BaseModel):
    season_id: UUID4
    episode_number: int
    title: str
    description: Optional[str] = None
    duration: Optional[int] = None
    air_date: Optional[date] = None


class EpisodeResponse(BaseModel):
    id: UUID4
    season_id: UUID4
    episode_number: int
    title: str
    description: Optional[str] = None
    duration: Optional[int] = None
    air_date: Optional[date] = None
    thumbnail_url: Optional[str] = None
    video_url: Optional[str] = None
    view_count: int

    class Config:
        from_attributes = True


# Pagination
class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    page_size: int
    total_pages: int
