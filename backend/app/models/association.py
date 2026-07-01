from sqlalchemy import Table, Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

movie_genres = Table(
    "movie_genres",
    Base.metadata,
    Column("movie_id", UUID(as_uuid=True), ForeignKey("movies.id"), primary_key=True),
    Column("genre_id", UUID(as_uuid=True), ForeignKey("genres.id"), primary_key=True),
)

movie_actors = Table(
    "movie_actors",
    Base.metadata,
    Column("movie_id", UUID(as_uuid=True), ForeignKey("movies.id"), primary_key=True),
    Column("actor_id", UUID(as_uuid=True), ForeignKey("actors.id"), primary_key=True),
)

show_genres = Table(
    "show_genres",
    Base.metadata,
    Column("show_id", UUID(as_uuid=True), ForeignKey("shows.id"), primary_key=True),
    Column("genre_id", UUID(as_uuid=True), ForeignKey("genres.id"), primary_key=True),
)

show_actors = Table(
    "show_actors",
    Base.metadata,
    Column("show_id", UUID(as_uuid=True), ForeignKey("shows.id"), primary_key=True),
    Column("actor_id", UUID(as_uuid=True), ForeignKey("actors.id"), primary_key=True),
)
