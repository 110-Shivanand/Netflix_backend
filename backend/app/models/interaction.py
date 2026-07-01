import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Integer, Float, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class WatchHistory(Base):
    __tablename__ = "watch_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    movie_id = Column(UUID(as_uuid=True), ForeignKey("movies.id"), nullable=True)
    show_id = Column(UUID(as_uuid=True), ForeignKey("shows.id"), nullable=True)
    episode_id = Column(UUID(as_uuid=True), ForeignKey("episodes.id"), nullable=True)
    progress = Column(Integer, default=0)       # seconds watched
    duration = Column(Integer, nullable=True)   # total duration in seconds
    completed = Column(Boolean, default=False)
    watched_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="watch_history")
    movie = relationship("Movie", back_populates="watch_history")
    show = relationship("Show", back_populates="watch_history")
    episode = relationship("Episode", back_populates="watch_history")


class Watchlist(Base):
    __tablename__ = "watchlist"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    movie_id = Column(UUID(as_uuid=True), ForeignKey("movies.id"), nullable=True)
    show_id = Column(UUID(as_uuid=True), ForeignKey("shows.id"), nullable=True)
    added_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("user_id", "movie_id", name="uq_watchlist_user_movie"),
        UniqueConstraint("user_id", "show_id", name="uq_watchlist_user_show"),
    )

    user = relationship("User", back_populates="watchlist")
    movie = relationship("Movie", back_populates="watchlist")
    show = relationship("Show", back_populates="watchlist")


class Rating(Base):
    __tablename__ = "ratings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    movie_id = Column(UUID(as_uuid=True), ForeignKey("movies.id"), nullable=True)
    show_id = Column(UUID(as_uuid=True), ForeignKey("shows.id"), nullable=True)
    score = Column(Float, nullable=False)  # 1.0 - 10.0
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("user_id", "movie_id", name="uq_rating_user_movie"),
        UniqueConstraint("user_id", "show_id", name="uq_rating_user_show"),
    )

    user = relationship("User", back_populates="ratings")
    movie = relationship("Movie", back_populates="ratings")
    show = relationship("Show", back_populates="ratings")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    movie_id = Column(UUID(as_uuid=True), ForeignKey("movies.id"), nullable=True)
    show_id = Column(UUID(as_uuid=True), ForeignKey("shows.id"), nullable=True)
    content = Column(Text, nullable=False)
    is_spoiler = Column(Boolean, default=False)
    likes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="reviews")
    movie = relationship("Movie", back_populates="reviews")
    show = relationship("Show", back_populates="reviews")
