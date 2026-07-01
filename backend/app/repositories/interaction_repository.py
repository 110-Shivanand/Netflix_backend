from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional, List
from uuid import UUID
from app.models.interaction import WatchHistory, Watchlist, Rating, Review


class WatchHistoryRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_history(self, user_id: UUID, skip: int = 0, limit: int = 20) -> List[WatchHistory]:
        return self.db.query(WatchHistory).filter(
            WatchHistory.user_id == user_id
        ).order_by(desc(WatchHistory.watched_at)).offset(skip).limit(limit).all()

    def get_entry(self, user_id: UUID, movie_id: UUID = None, episode_id: UUID = None) -> Optional[WatchHistory]:
        query = self.db.query(WatchHistory).filter(WatchHistory.user_id == user_id)
        if movie_id:
            query = query.filter(WatchHistory.movie_id == movie_id)
        if episode_id:
            query = query.filter(WatchHistory.episode_id == episode_id)
        return query.first()

    def upsert(self, user_id: UUID, progress: int, duration: int = None,
               movie_id: UUID = None, show_id: UUID = None, episode_id: UUID = None) -> WatchHistory:
        entry = self.get_entry(user_id, movie_id=movie_id, episode_id=episode_id)
        if entry:
            entry.progress = progress
            if duration:
                entry.duration = duration
            entry.completed = duration and progress >= duration * 0.9
            from datetime import datetime
            entry.updated_at = datetime.utcnow()
        else:
            entry = WatchHistory(
                user_id=user_id,
                movie_id=movie_id,
                show_id=show_id,
                episode_id=episode_id,
                progress=progress,
                duration=duration,
                completed=duration and progress >= duration * 0.9,
            )
            self.db.add(entry)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def get_continue_watching(self, user_id: UUID, limit: int = 10) -> List[WatchHistory]:
        return self.db.query(WatchHistory).filter(
            WatchHistory.user_id == user_id,
            WatchHistory.completed == False,
            WatchHistory.progress > 30,
        ).order_by(desc(WatchHistory.updated_at)).limit(limit).all()

    def get_most_watched_genres(self, user_id: UUID) -> List[str]:
        from app.models.content import Movie, Genre
        from app.models.association import movie_genres
        result = (
            self.db.query(Genre.slug, func.count(Genre.id).label("cnt"))
            .join(movie_genres, Genre.id == movie_genres.c.genre_id)
            .join(Movie, Movie.id == movie_genres.c.movie_id)
            .join(WatchHistory, WatchHistory.movie_id == Movie.id)
            .filter(WatchHistory.user_id == user_id)
            .group_by(Genre.slug)
            .order_by(desc("cnt"))
            .limit(5)
            .all()
        )
        return [r[0] for r in result]


class WatchlistRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_watchlist(self, user_id: UUID, skip: int = 0, limit: int = 20) -> List[Watchlist]:
        return self.db.query(Watchlist).filter(
            Watchlist.user_id == user_id
        ).order_by(desc(Watchlist.added_at)).offset(skip).limit(limit).all()

    def get_entry(self, user_id: UUID, movie_id: UUID = None, show_id: UUID = None) -> Optional[Watchlist]:
        query = self.db.query(Watchlist).filter(Watchlist.user_id == user_id)
        if movie_id:
            query = query.filter(Watchlist.movie_id == movie_id)
        if show_id:
            query = query.filter(Watchlist.show_id == show_id)
        return query.first()

    def add(self, user_id: UUID, movie_id: UUID = None, show_id: UUID = None) -> Watchlist:
        entry = Watchlist(user_id=user_id, movie_id=movie_id, show_id=show_id)
        self.db.add(entry)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def remove(self, entry: Watchlist):
        self.db.delete(entry)
        self.db.commit()


class RatingRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_rating(self, user_id: UUID, movie_id: UUID = None, show_id: UUID = None) -> Optional[Rating]:
        query = self.db.query(Rating).filter(Rating.user_id == user_id)
        if movie_id:
            query = query.filter(Rating.movie_id == movie_id)
        if show_id:
            query = query.filter(Rating.show_id == show_id)
        return query.first()

    def create_or_update(self, user_id: UUID, score: float,
                         movie_id: UUID = None, show_id: UUID = None) -> Rating:
        rating = self.get_user_rating(user_id, movie_id=movie_id, show_id=show_id)
        if rating:
            rating.score = score
        else:
            rating = Rating(user_id=user_id, score=score, movie_id=movie_id, show_id=show_id)
            self.db.add(rating)
        self.db.commit()
        self.db.refresh(rating)
        return rating

    def get_average(self, movie_id: UUID = None, show_id: UUID = None) -> float:
        query = self.db.query(func.avg(Rating.score))
        if movie_id:
            query = query.filter(Rating.movie_id == movie_id)
        if show_id:
            query = query.filter(Rating.show_id == show_id)
        result = query.scalar()
        return round(float(result), 2) if result else 0.0


class ReviewRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_content(self, movie_id: UUID = None, show_id: UUID = None,
                       skip: int = 0, limit: int = 20) -> List[Review]:
        query = self.db.query(Review)
        if movie_id:
            query = query.filter(Review.movie_id == movie_id)
        if show_id:
            query = query.filter(Review.show_id == show_id)
        return query.order_by(desc(Review.created_at)).offset(skip).limit(limit).all()

    def create(self, user_id: UUID, content: str, is_spoiler: bool,
               movie_id: UUID = None, show_id: UUID = None) -> Review:
        review = Review(
            user_id=user_id, content=content, is_spoiler=is_spoiler,
            movie_id=movie_id, show_id=show_id
        )
        self.db.add(review)
        self.db.commit()
        self.db.refresh(review)
        return review

    def delete(self, review: Review):
        self.db.delete(review)
        self.db.commit()
