from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.middleware.auth_middleware import get_current_user, get_current_admin
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserResponse, UserProfileResponse, UserProfileUpdate
from app.services.minio_service import minio_service
from app.utils.helpers import allowed_image_type
from app.models.user import User
from typing import List

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/me/profile", response_model=UserProfileResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    if not current_user.profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return current_user.profile


@router.put("/me/profile", response_model=UserProfileResponse)
def update_profile(
    data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    repo = UserRepository(db)
    profile = repo.update_profile(current_user.id, **data.model_dump(exclude_none=True))
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.post("/me/avatar")
def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not allowed_image_type(file.content_type):
        raise HTTPException(status_code=400, detail="Only image files are allowed")
    data = file.file.read()
    ext = file.filename.split(".")[-1]
    key = minio_service.upload_file(data, file.content_type, folder="avatars", extension=ext)
    url = minio_service.get_url(key)
    repo = UserRepository(db)
    repo.update_profile(current_user.id, avatar_url=url)
    return {"avatar_url": url}


# ---- Admin Routes ----

@router.get("/", response_model=List[UserResponse])
def list_users(
    skip: int = 0,
    limit: int = 20,
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    repo = UserRepository(db)
    return repo.get_all(skip=skip, limit=limit)


@router.put("/{user_id}/toggle-active")
def toggle_user_active(
    user_id: str,
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    repo = UserRepository(db)
    user = repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    repo.update(user, is_active=not user.is_active)
    return {"message": f"User {'activated' if user.is_active else 'deactivated'}"}


@router.delete("/{user_id}")
def delete_user(
    user_id: str,
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    repo = UserRepository(db)
    user = repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    repo.delete(user)
    return {"message": "User deleted"}
