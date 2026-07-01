from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.auth_service import AuthService
from app.schemas.user import (
    UserRegister, UserLogin, TokenResponse, RefreshTokenRequest,
    ForgotPasswordRequest, ResetPasswordRequest, EmailVerifyRequest,
)
from app.middleware.auth_middleware import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", status_code=201)
def register(data: UserRegister, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.register(data)


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.login(data.email, data.password)


@router.post("/refresh", response_model=TokenResponse)
def refresh(data: RefreshTokenRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.refresh_tokens(data.refresh_token)


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = AuthService(db)
    service.logout(str(current_user.id))
    return {"message": "Logged out successfully"}


@router.post("/verify-email")
def verify_email(data: EmailVerifyRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.verify_email(data.token)


@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.forgot_password(data.email)


@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.reset_password(data.token, data.new_password)
