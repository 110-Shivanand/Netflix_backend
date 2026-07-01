from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.services.recommendation_service import RecommendationService
from app.models.user import User

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.get("/")
def get_recommendations(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = RecommendationService(db)
    return service.get_recommendations(current_user.id, limit=limit)
