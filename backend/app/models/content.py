import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, DateTime, ForeignKey,
    Text, Integer, Float, Date
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.association import movie_genres, movie_actors, show_genres, show_actors


class Genre(Base):
    __tablename__ = "genres"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    movies = relationship("Movie", secondary=movie_genres, back_populates="genres")
    shows = relationship("Show", secondary=show_genres, back_populates="genres")


class Actor(Base):
    __tablename__ = "actors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    bio = Column(Text, nullable=True)
    photo_url = Column(String(500), nullable=True)
    birth_date = Column(Date, nullable=True)
    nationality = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    movies = relationship("Movie", secondary=movie_actors, back_populates="actors")
    shows = relationship("Show", secondary=show_actors, back_populates="actors")


class Movie(Base):
    __tablename__ = "movies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(300), nullable=False, index=True)
    slug = Column(String(300), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    release_date = Column(Date, nullable=True)
    duration = Column(Integer, nullable=True)  # in seconds
    language = Column(String(50), nullable=True)
    country = Column(String(100), nullable=True)
    maturity_rating = Column(String(20), nullable=True)  # PG, PG-13, R, etc.
    imdb_rating = Column(Float, nullable=True)
    average_rating = Column(Float, default=0.0)
    view_count = Column(Integer, default=0)
    is_featured = Column(Boolean, default=False)
    is_trending = Column(Boolean, default=False)
    is_new_release = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    # Media
    thumbnail_url = Column(String(500), nullable=True)
    banner_url = Column(String(500), nullable=True)
    trailer_url = Column(String(500), nullable=True)
    video_url = Column(String(500), nullable=True)
    hls_url = Column(String(500), nullable=True)
    video_key = Column(String(500), nullable=True)  # MinIO object key

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    genres = relationship("Genre", secondary=movie_genres, back_populates="movies")
    actors = relationship("Actor", secondary=movie_actors, back_populates="movies")
    watch_history = relationship("WatchHistory", back_populates="movie")
    watchlist = relationship("Watchlist", back_populates="movie")
    ratings = relationship("Rating", back_populates="movie")
    reviews = relationship("Review", back_populates="movie")


class Show(Base):
    __tablename__ = "shows"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(300), nullable=False, index=True)
    slug = Column(String(300), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    first_air_date = Column(Date, nullable=True)
    last_air_date = Column(Date, nullable=True)
    language = Column(String(50), nullable=True)
    country = Column(String(100), nullable=True)
    maturity_rating = Column(String(20), nullable=True)
    imdb_rating = Column(Float, nullable=True)
    average_rating = Column(Float, default=0.0)
    view_count = Column(Integer, default=0)
    is_featured = Column(Boolean, default=False)
    is_trending = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    status = Column(String(50), default="ongoing")  # ongoing, ended, cancelled

    thumbnail_url = Column(String(500), nullable=True)
    banner_url = Column(String(500), nullable=True)
    trailer_url = Column(String(500), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    genres = relationship("Genre", secondary=show_genres, back_populates="shows")
    actors = relationship("Actor", secondary=show_actors, back_populates="shows")
    seasons = relationship("Season", back_populates="show", cascade="all, delete-orphan")
    watch_history = relationship("WatchHistory", back_populates="show")
    watchlist = relationship("Watchlist", back_populates="show")
    ratings = relationship("Rating", back_populates="show")
    reviews = relationship("Review", back_populates="show")


class Season(Base):
    __tablename__ = "seasons"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    show_id = Column(UUID(as_uuid=True), ForeignKey("shows.id"), nullable=False)
    season_number = Column(Integer, nullable=False)
    title = Column(String(300), nullable=True)
    description = Column(Text, nullable=True)
    air_date = Column(Date, nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    show = relationship("Show", back_populates="seasons")
    episodes = relationship("Episode", back_populates="season", cascade="all, delete-orphan")


class Episode(Base):
    __tablename__ = "episodes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    season_id = Column(UUID(as_uuid=True), ForeignKey("seasons.id"), nullable=False)
    episode_number = Column(Integer, nullable=False)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    duration = Column(Integer, nullable=True)  # in seconds
    air_date = Column(Date, nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    video_url = Column(String(500), nullable=True)
    hls_url = Column(String(500), nullable=True)
    video_key = Column(String(500), nullable=True)
    view_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    season = relationship("Season", back_populates="episodes")
    watch_history = relationship("WatchHistory", back_populates="episode")


class Banner(Base):
    __tablename__ = "banners"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(300), nullable=False)
    subtitle = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=False)
    link_url = Column(String(500), nullable=True)
    movie_id = Column(UUID(as_uuid=True), ForeignKey("movies.id"), nullable=True)
    show_id = Column(UUID(as_uuid=True), ForeignKey("shows.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
