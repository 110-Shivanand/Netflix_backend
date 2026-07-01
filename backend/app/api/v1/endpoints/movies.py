from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.middleware.auth_middleware import get_current_admin, get_optional_user
from app.repositories.content_repository import MovieRepository, GenreRepository, ActorRepository
from app.services.minio_service import minio_service
from app.services.recommendation_service import RecommendationService
from app.schemas.content import MovieCreate, MovieUpdate, MovieResponse, PaginatedResponse
from app.utils.helpers import allowed_image_type, allowed_video_type, paginate
from app.models.user import User

router = APIRouter(prefix="/movies", tags=["Movies"])


@router.get("/", response_model=PaginatedResponse)
def list_movies(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    genre: Optional[str] = None,
    sort_by: Optional[str] = "created_at",
    db: Session = Depends(get_db),
):
    skip = (page - 1) * page_size
    repo = MovieRepository(db)
    total = repo.count(genre_slug=genre)
    items = repo.get_all(skip=skip, limit=page_size, genre_slug=genre)
    meta = paginate(total, page, page_size)
    return PaginatedResponse(items=[MovieResponse.model_validate(m) for m in items], **meta)


@router.get("/trending", response_model=List[MovieResponse])
def trending_movies(limit: int = 10, db: Session = Depends(get_db)):
    repo = MovieRepository(db)
    return repo.get_trending(limit=limit)


@router.get("/featured", response_model=List[MovieResponse])
def featured_movies(limit: int = 5, db: Session = Depends(get_db)):
    repo = MovieRepository(db)
    return repo.get_featured(limit=limit)


@router.get("/new-releases", response_model=List[MovieResponse])
def new_releases(limit: int = 10, db: Session = Depends(get_db)):
    repo = MovieRepository(db)
    return repo.get_new_releases(limit=limit)


@router.get("/top-rated", response_model=List[MovieResponse])
def top_rated(limit: int = 10, db: Session = Depends(get_db)):
    repo = MovieRepository(db)
    return repo.get_top_rated(limit=limit)


@router.get("/{slug}", response_model=MovieResponse)
def get_movie(slug: str, db: Session = Depends(get_db)):
    repo = MovieRepository(db)
    movie = repo.get_by_slug(slug)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    return movie


@router.get("/{movie_id}/similar", response_model=List[MovieResponse])
def similar_movies(movie_id: str, limit: int = 8, db: Session = Depends(get_db)):
    service = RecommendationService(db)
    return service.get_similar_movies(movie_id, limit=limit)


# ---- Admin Endpoints ----

@router.post("/", response_model=MovieResponse, status_code=201)
def create_movie(
    data: MovieCreate,
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    repo = MovieRepository(db)
    genre_repo = GenreRepository(db)
    actor_repo = ActorRepository(db)

    movie = repo.create(
        title=data.title,
        slug=data.slug,
        description=data.description,
        release_date=data.release_date,
        duration=data.duration,
        language=data.language,
        country=data.country,
        maturity_rating=data.maturity_rating,
        imdb_rating=data.imdb_rating,
        is_featured=data.is_featured,
        is_trending=data.is_trending,
        is_new_release=data.is_new_release,
    )

    if data.genre_ids:
        for gid in data.genre_ids:
            genre = genre_repo.get_by_id(gid)
            if genre:
                movie.genres.append(genre)
    if data.actor_ids:
        for aid in data.actor_ids:
            actor = actor_repo.get_by_id(aid)
            if actor:
                movie.actors.append(actor)

    db.commit()
    db.refresh(movie)
    return movie


@router.put("/{movie_id}", response_model=MovieResponse)
def update_movie(
    movie_id: str,
    data: MovieUpdate,
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    repo = MovieRepository(db)
    movie = db.query(__import__("app.models.content", fromlist=["Movie"]).Movie).filter_by(id=movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    update_data = data.model_dump(exclude_none=True, exclude={"genre_ids", "actor_ids"})
    movie = repo.update(movie, **update_data)

    if data.genre_ids is not None:
        genre_repo = GenreRepository(db)
        movie.genres = [genre_repo.get_by_id(gid) for gid in data.genre_ids if genre_repo.get_by_id(gid)]
        db.commit()

    return movie


@router.delete("/{movie_id}")
def delete_movie(
    movie_id: str,
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    repo = MovieRepository(db)
    movie = repo.get_by_id(movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    repo.delete(movie)
    return {"message": "Movie deleted"}


@router.post("/{movie_id}/thumbnail")
def upload_thumbnail(
    movie_id: str,
    file: UploadFile = File(...),
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    if not allowed_image_type(file.content_type):
        raise HTTPException(status_code=400, detail="Only image files are allowed")
    repo = MovieRepository(db)
    movie = repo.get_by_id(movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    data = file.file.read()
    ext = file.filename.split(".")[-1]
    key = minio_service.upload_file(data, file.content_type, folder="thumbnails", extension=ext)
    url = minio_service.get_url(key)
    repo.update(movie, thumbnail_url=url)
    return {"thumbnail_url": url}


@router.post("/{movie_id}/banner")
def upload_banner(
    movie_id: str,
    file: UploadFile = File(...),
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    if not allowed_image_type(file.content_type):
        raise HTTPException(status_code=400, detail="Only image files are allowed")
    repo = MovieRepository(db)
    movie = repo.get_by_id(movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    data = file.file.read()
    ext = file.filename.split(".")[-1]
    key = minio_service.upload_file(data, file.content_type, folder="banners", extension=ext)
    url = minio_service.get_url(key)
    repo.update(movie, banner_url=url)
    return {"banner_url": url}
