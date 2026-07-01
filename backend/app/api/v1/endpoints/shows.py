from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.middleware.auth_middleware import get_current_admin
from app.repositories.content_repository import ShowRepository, SeasonRepository, EpisodeRepository, GenreRepository
from app.services.minio_service import minio_service
from app.services.recommendation_service import RecommendationService
from app.schemas.content import (
    ShowCreate, ShowUpdate, ShowResponse,
    SeasonCreate, SeasonResponse,
    EpisodeCreate, EpisodeResponse,
    PaginatedResponse,
)
from app.utils.helpers import allowed_image_type, allowed_video_type, paginate
from app.models.user import User

router = APIRouter(prefix="/shows", tags=["Shows"])


@router.get("/", response_model=PaginatedResponse)
def list_shows(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    genre: Optional[str] = None,
    db: Session = Depends(get_db),
):
    skip = (page - 1) * page_size
    repo = ShowRepository(db)
    total = repo.count(genre_slug=genre)
    items = repo.get_all(skip=skip, limit=page_size, genre_slug=genre)
    meta = paginate(total, page, page_size)
    return PaginatedResponse(items=[ShowResponse.model_validate(s) for s in items], **meta)


@router.get("/trending", response_model=List[ShowResponse])
def trending_shows(limit: int = 10, db: Session = Depends(get_db)):
    return ShowRepository(db).get_trending(limit=limit)


@router.get("/featured", response_model=List[ShowResponse])
def featured_shows(limit: int = 5, db: Session = Depends(get_db)):
    return ShowRepository(db).get_featured(limit=limit)


@router.get("/top-rated", response_model=List[ShowResponse])
def top_rated_shows(limit: int = 10, db: Session = Depends(get_db)):
    return ShowRepository(db).get_top_rated(limit=limit)


@router.get("/{slug}", response_model=ShowResponse)
def get_show(slug: str, db: Session = Depends(get_db)):
    show = ShowRepository(db).get_by_slug(slug)
    if not show:
        raise HTTPException(status_code=404, detail="Show not found")
    return show


@router.get("/{show_id}/seasons", response_model=List[SeasonResponse])
def get_seasons(show_id: str, db: Session = Depends(get_db)):
    return SeasonRepository(db).get_by_show(show_id)


@router.get("/seasons/{season_id}/episodes", response_model=List[EpisodeResponse])
def get_episodes(season_id: str, db: Session = Depends(get_db)):
    return EpisodeRepository(db).get_by_season(season_id)


@router.get("/{show_id}/similar", response_model=List[ShowResponse])
def similar_shows(show_id: str, limit: int = 8, db: Session = Depends(get_db)):
    return RecommendationService(db).get_similar_shows(show_id, limit=limit)


# ---- Admin ----

@router.post("/", response_model=ShowResponse, status_code=201)
def create_show(
    data: ShowCreate,
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    repo = ShowRepository(db)
    genre_repo = GenreRepository(db)
    show = repo.create(
        title=data.title, slug=data.slug, description=data.description,
        first_air_date=data.first_air_date, language=data.language,
        country=data.country, maturity_rating=data.maturity_rating,
        imdb_rating=data.imdb_rating, is_featured=data.is_featured, is_trending=data.is_trending,
    )
    if data.genre_ids:
        for gid in data.genre_ids:
            genre = genre_repo.get_by_id(gid)
            if genre:
                show.genres.append(genre)
    db.commit()
    db.refresh(show)
    return show


@router.post("/seasons", response_model=SeasonResponse, status_code=201)
def create_season(
    data: SeasonCreate,
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return SeasonRepository(db).create(**data.model_dump())


@router.post("/episodes", response_model=EpisodeResponse, status_code=201)
def create_episode(
    data: EpisodeCreate,
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return EpisodeRepository(db).create(**data.model_dump())


@router.post("/{show_id}/thumbnail")
def upload_show_thumbnail(
    show_id: str,
    file: UploadFile = File(...),
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    if not allowed_image_type(file.content_type):
        raise HTTPException(status_code=400, detail="Only image files are allowed")
    repo = ShowRepository(db)
    show = repo.get_by_id(show_id)
    if not show:
        raise HTTPException(status_code=404, detail="Show not found")
    data = file.file.read()
    ext = file.filename.split(".")[-1]
    key = minio_service.upload_file(data, file.content_type, folder="thumbnails", extension=ext)
    url = minio_service.get_url(key)
    repo.update(show, thumbnail_url=url)
    return {"thumbnail_url": url}


@router.post("/episodes/{episode_id}/video")
def upload_episode_video(
    episode_id: str,
    file: UploadFile = File(...),
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    if not allowed_video_type(file.content_type):
        raise HTTPException(status_code=400, detail="Only video files allowed")
    repo = EpisodeRepository(db)
    episode = repo.get_by_id(episode_id)
    if not episode:
        raise HTTPException(status_code=404, detail="Episode not found")
    data = file.file.read()
    key = minio_service.upload_file(data, file.content_type, folder="episodes", extension="mp4")
    url = minio_service.get_url(key)
    episode.video_url = url
    episode.video_key = key
    db.commit()
    return {"video_url": url}
