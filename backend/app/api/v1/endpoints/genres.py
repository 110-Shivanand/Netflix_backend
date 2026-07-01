from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.middleware.auth_middleware import get_current_admin
from app.repositories.content_repository import GenreRepository
from app.schemas.content import GenreCreate, GenreResponse
from app.models.user import User

router = APIRouter(prefix="/genres", tags=["Genres"])


@router.get("/", response_model=List[GenreResponse])
def list_genres(db: Session = Depends(get_db)):
    return GenreRepository(db).get_all()


@router.post("/", response_model=GenreResponse, status_code=201)
def create_genre(
    data: GenreCreate,
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    repo = GenreRepository(db)
    if repo.get_by_slug(data.slug):
        raise HTTPException(status_code=400, detail="Genre slug already exists")
    return repo.create(name=data.name, slug=data.slug, description=data.description)


@router.delete("/{genre_id}")
def delete_genre(
    genre_id: str,
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    repo = GenreRepository(db)
    genre = repo.get_by_id(genre_id)
    if not genre:
        raise HTTPException(status_code=404, detail="Genre not found")
    repo.delete(genre)
    return {"message": "Genre deleted"}
