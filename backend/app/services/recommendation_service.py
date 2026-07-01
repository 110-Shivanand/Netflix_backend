from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List
from uuid import UUID
from app.models.content import Movie, Show, Genre
from app.models.interaction import WatchHistory, Rating
from app.models.association import movie_genres, show_genres
from app.repositories.interaction_repository import WatchHistoryRepository


class RecommendationService:
    def __init__(self, db: Session):
        self.db = db
        self.history_repo = WatchHistoryRepository(db)

    def get_recommendations(self, user_id: UUID, limit: int = 10) -> dict:
        """Return recommended movies and shows based on user behavior."""
        top_genres = self.history_repo.get_most_watched_genres(user_id)

        movies = self._recommend_movies(user_id, top_genres, limit)
        shows = self._recommend_shows(user_id, top_genres, limit)

        return {"movies": movies, "shows": shows}

    def _recommend_movies(self, user_id: UUID, genre_slugs: List[str], limit: int) -> List[Movie]:
        # Get recently watched movie IDs to exclude
        watched_ids = [
            h.movie_id for h in
            self.db.query(WatchHistory).filter(
                WatchHistory.user_id == user_id,
                WatchHistory.movie_id.isnot(None),
            ).all()
        ]

        query = self.db.query(Movie).filter(Movie.is_active == True)

        if genre_slugs:
            query = query.join(Movie.genres).filter(Genre.slug.in_(genre_slugs))

        if watched_ids:
            query = query.filter(Movie.id.notin_(watched_ids))

        return query.order_by(desc(Movie.average_rating), desc(Movie.view_count)).limit(limit).all()

    def _recommend_shows(self, user_id: UUID, genre_slugs: List[str], limit: int) -> List[Show]:
        watched_show_ids = [
            h.show_id for h in
            self.db.query(WatchHistory).filter(
                WatchHistory.user_id == user_id,
                WatchHistory.show_id.isnot(None),
            ).all()
        ]

        query = self.db.query(Show).filter(Show.is_active == True)

        if genre_slugs:
            query = query.join(Show.genres).filter(Genre.slug.in_(genre_slugs))

        if watched_show_ids:
            query = query.filter(Show.id.notin_(watched_show_ids))

        return query.order_by(desc(Show.average_rating), desc(Show.view_count)).limit(limit).all()

    def get_similar_movies(self, movie_id: UUID, limit: int = 8) -> List[Movie]:
        """Find movies with overlapping genres."""
        movie = self.db.query(Movie).filter(Movie.id == movie_id).first()
        if not movie:
            return []

        genre_ids = [g.id for g in movie.genres]
        if not genre_ids:
            return self.db.query(Movie).filter(
                Movie.is_active == True, Movie.id != movie_id
            ).order_by(desc(Movie.average_rating)).limit(limit).all()

        return (
            self.db.query(Movie)
            .join(Movie.genres)
            .filter(Genre.id.in_(genre_ids), Movie.id != movie_id, Movie.is_active == True)
            .group_by(Movie.id)
            .order_by(desc(func.count(Genre.id)), desc(Movie.average_rating))
            .limit(limit)
            .all()
        )

    def get_similar_shows(self, show_id: UUID, limit: int = 8) -> List[Show]:
        show = self.db.query(Show).filter(Show.id == show_id).first()
        if not show:
            return []

        genre_ids = [g.id for g in show.genres]
        if not genre_ids:
            return self.db.query(Show).filter(
                Show.is_active == True, Show.id != show_id
            ).order_by(desc(Show.average_rating)).limit(limit).all()

        return (
            self.db.query(Show)
            .join(Show.genres)
            .filter(Genre.id.in_(genre_ids), Show.id != show_id, Show.is_active == True)
            .group_by(Show.id)
            .order_by(desc(func.count(Genre.id)), desc(Show.average_rating))
            .limit(limit)
            .all()
        )
