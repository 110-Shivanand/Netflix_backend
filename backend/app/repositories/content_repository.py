from sqlalchemy.orm import Session
from sqlalchemy import or_, func, desc
from typing import Optional, List
from uuid import UUID
from app.models.content import Movie, Show, Season, Episode, Genre, Actor, Banner


class MovieRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, movie_id: UUID) -> Optional[Movie]:
        return self.db.query(Movie).filter(Movie.id == movie_id, Movie.is_active == True).first()

    def get_by_slug(self, slug: str) -> Optional[Movie]:
        return self.db.query(Movie).filter(Movie.slug == slug, Movie.is_active == True).first()

    def get_all(self, skip: int = 0, limit: int = 20, genre_slug: str = None) -> List[Movie]:
        query = self.db.query(Movie).filter(Movie.is_active == True)
        if genre_slug:
            query = query.join(Movie.genres).filter(Genre.slug == genre_slug)
        return query.order_by(desc(Movie.created_at)).offset(skip).limit(limit).all()

    def count(self, genre_slug: str = None) -> int:
        query = self.db.query(func.count(Movie.id)).filter(Movie.is_active == True)
        if genre_slug:
            query = query.join(Movie.genres).filter(Genre.slug == genre_slug)
        return query.scalar()

    def get_trending(self, limit: int = 10) -> List[Movie]:
        return self.db.query(Movie).filter(
            Movie.is_active == True, Movie.is_trending == True
        ).order_by(desc(Movie.view_count)).limit(limit).all()

    def get_featured(self, limit: int = 5) -> List[Movie]:
        return self.db.query(Movie).filter(
            Movie.is_active == True, Movie.is_featured == True
        ).limit(limit).all()

    def get_new_releases(self, limit: int = 10) -> List[Movie]:
        return self.db.query(Movie).filter(
            Movie.is_active == True, Movie.is_new_release == True
        ).order_by(desc(Movie.release_date)).limit(limit).all()

    def get_top_rated(self, limit: int = 10) -> List[Movie]:
        return self.db.query(Movie).filter(
            Movie.is_active == True, Movie.average_rating > 0
        ).order_by(desc(Movie.average_rating)).limit(limit).all()

    def search(self, query: str, skip: int = 0, limit: int = 20) -> List[Movie]:
        return self.db.query(Movie).filter(
            Movie.is_active == True,
            or_(
                Movie.title.ilike(f"%{query}%"),
                Movie.description.ilike(f"%{query}%"),
            )
        ).offset(skip).limit(limit).all()

    def create(self, **kwargs) -> Movie:
        movie = Movie(**kwargs)
        self.db.add(movie)
        self.db.commit()
        self.db.refresh(movie)
        return movie

    def update(self, movie: Movie, **kwargs) -> Movie:
        for key, value in kwargs.items():
            setattr(movie, key, value)
        self.db.commit()
        self.db.refresh(movie)
        return movie

    def delete(self, movie: Movie):
        movie.is_active = False
        self.db.commit()

    def increment_views(self, movie_id: UUID):
        self.db.query(Movie).filter(Movie.id == movie_id).update(
            {Movie.view_count: Movie.view_count + 1}
        )
        self.db.commit()

    def update_rating(self, movie_id: UUID, avg_rating: float):
        self.db.query(Movie).filter(Movie.id == movie_id).update(
            {Movie.average_rating: avg_rating}
        )
        self.db.commit()


class ShowRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, show_id: UUID) -> Optional[Show]:
        return self.db.query(Show).filter(Show.id == show_id, Show.is_active == True).first()

    def get_by_slug(self, slug: str) -> Optional[Show]:
        return self.db.query(Show).filter(Show.slug == slug, Show.is_active == True).first()

    def get_all(self, skip: int = 0, limit: int = 20, genre_slug: str = None) -> List[Show]:
        query = self.db.query(Show).filter(Show.is_active == True)
        if genre_slug:
            query = query.join(Show.genres).filter(Genre.slug == genre_slug)
        return query.order_by(desc(Show.created_at)).offset(skip).limit(limit).all()

    def count(self, genre_slug: str = None) -> int:
        query = self.db.query(func.count(Show.id)).filter(Show.is_active == True)
        if genre_slug:
            query = query.join(Show.genres).filter(Genre.slug == genre_slug)
        return query.scalar()

    def get_trending(self, limit: int = 10) -> List[Show]:
        return self.db.query(Show).filter(
            Show.is_active == True, Show.is_trending == True
        ).order_by(desc(Show.view_count)).limit(limit).all()

    def get_featured(self, limit: int = 5) -> List[Show]:
        return self.db.query(Show).filter(
            Show.is_active == True, Show.is_featured == True
        ).limit(limit).all()

    def get_top_rated(self, limit: int = 10) -> List[Show]:
        return self.db.query(Show).filter(
            Show.is_active == True, Show.average_rating > 0
        ).order_by(desc(Show.average_rating)).limit(limit).all()

    def search(self, query: str, skip: int = 0, limit: int = 20) -> List[Show]:
        return self.db.query(Show).filter(
            Show.is_active == True,
            or_(
                Show.title.ilike(f"%{query}%"),
                Show.description.ilike(f"%{query}%"),
            )
        ).offset(skip).limit(limit).all()

    def create(self, **kwargs) -> Show:
        show = Show(**kwargs)
        self.db.add(show)
        self.db.commit()
        self.db.refresh(show)
        return show

    def update(self, show: Show, **kwargs) -> Show:
        for key, value in kwargs.items():
            setattr(show, key, value)
        self.db.commit()
        self.db.refresh(show)
        return show

    def delete(self, show: Show):
        show.is_active = False
        self.db.commit()


class GenreRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> List[Genre]:
        return self.db.query(Genre).all()

    def get_by_id(self, genre_id: UUID) -> Optional[Genre]:
        return self.db.query(Genre).filter(Genre.id == genre_id).first()

    def get_by_slug(self, slug: str) -> Optional[Genre]:
        return self.db.query(Genre).filter(Genre.slug == slug).first()

    def create(self, name: str, slug: str, description: str = None) -> Genre:
        genre = Genre(name=name, slug=slug, description=description)
        self.db.add(genre)
        self.db.commit()
        self.db.refresh(genre)
        return genre

    def delete(self, genre: Genre):
        self.db.delete(genre)
        self.db.commit()


class ActorRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 20) -> List[Actor]:
        return self.db.query(Actor).offset(skip).limit(limit).all()

    def get_by_id(self, actor_id: UUID) -> Optional[Actor]:
        return self.db.query(Actor).filter(Actor.id == actor_id).first()

    def search(self, query: str) -> List[Actor]:
        return self.db.query(Actor).filter(Actor.name.ilike(f"%{query}%")).limit(20).all()

    def create(self, **kwargs) -> Actor:
        actor = Actor(**kwargs)
        self.db.add(actor)
        self.db.commit()
        self.db.refresh(actor)
        return actor

    def update(self, actor: Actor, **kwargs) -> Actor:
        for key, value in kwargs.items():
            setattr(actor, key, value)
        self.db.commit()
        self.db.refresh(actor)
        return actor


class SeasonRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_show(self, show_id: UUID) -> List[Season]:
        return self.db.query(Season).filter(
            Season.show_id == show_id, Season.is_active == True
        ).order_by(Season.season_number).all()

    def get_by_id(self, season_id: UUID) -> Optional[Season]:
        return self.db.query(Season).filter(Season.id == season_id).first()

    def create(self, **kwargs) -> Season:
        season = Season(**kwargs)
        self.db.add(season)
        self.db.commit()
        self.db.refresh(season)
        return season


class EpisodeRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_season(self, season_id: UUID) -> List[Episode]:
        return self.db.query(Episode).filter(
            Episode.season_id == season_id, Episode.is_active == True
        ).order_by(Episode.episode_number).all()

    def get_by_id(self, episode_id: UUID) -> Optional[Episode]:
        return self.db.query(Episode).filter(Episode.id == episode_id).first()

    def create(self, **kwargs) -> Episode:
        episode = Episode(**kwargs)
        self.db.add(episode)
        self.db.commit()
        self.db.refresh(episode)
        return episode

    def increment_views(self, episode_id: UUID):
        self.db.query(Episode).filter(Episode.id == episode_id).update(
            {Episode.view_count: Episode.view_count + 1}
        )
        self.db.commit()
