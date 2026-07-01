from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.user_repository import UserRepository
from app.core.security import (
    verify_password, get_password_hash,
    create_access_token, create_refresh_token, decode_token,
    create_email_verification_token, create_password_reset_token,
)
from app.core.redis_client import get_redis
from app.services.email_service import EmailService
from app.schemas.user import UserRegister, TokenResponse


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.email_service = EmailService()
        self.redis = get_redis()

    def register(self, data: UserRegister) -> dict:
        if self.user_repo.get_by_email(data.email):
            raise HTTPException(status_code=400, detail="Email already registered")
        if self.user_repo.get_by_username(data.username):
            raise HTTPException(status_code=400, detail="Username already taken")

        hashed = get_password_hash(data.password)
        user = self.user_repo.create(
            email=data.email,
            username=data.username,
            hashed_password=hashed,
        )

        if data.full_name:
            self.user_repo.update_profile(user.id, full_name=data.full_name)

        # Send verification email
        token = create_email_verification_token(data.email)
        self.email_service.send_verification_email(data.email, token)

        return {"message": "Registration successful. Please check your email to verify your account."}

    def login(self, email: str, password: str) -> TokenResponse:
        user = self.user_repo.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )
        if not user.is_active:
            raise HTTPException(status_code=400, detail="Account is disabled")
        if not user.is_verified:
            raise HTTPException(status_code=400, detail="Please verify your email first")

        self.user_repo.update(user, last_login=datetime.utcnow())

        payload = {"sub": str(user.id), "email": user.email, "is_admin": user.is_admin}
        access_token = create_access_token(payload)
        refresh_token = create_refresh_token(payload)

        # Store refresh token in Redis
        self.redis.setex(
            f"refresh_token:{str(user.id)}",
            60 * 60 * 24 * 7,  # 7 days
            refresh_token,
        )

        return TokenResponse(access_token=access_token, refresh_token=refresh_token)

    def refresh_tokens(self, refresh_token: str) -> TokenResponse:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        user_id = payload.get("sub")
        stored = self.redis.get(f"refresh_token:{user_id}")
        if not stored or stored != refresh_token:
            raise HTTPException(status_code=401, detail="Refresh token expired or revoked")

        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        new_payload = {"sub": str(user.id), "email": user.email, "is_admin": user.is_admin}
        access_token = create_access_token(new_payload)
        new_refresh = create_refresh_token(new_payload)

        self.redis.setex(f"refresh_token:{user_id}", 60 * 60 * 24 * 7, new_refresh)

        return TokenResponse(access_token=access_token, refresh_token=new_refresh)

    def logout(self, user_id: str):
        self.redis.delete(f"refresh_token:{user_id}")

    def verify_email(self, token: str):
        payload = decode_token(token)
        if not payload or payload.get("type") != "email_verify":
            raise HTTPException(status_code=400, detail="Invalid or expired token")

        email = payload.get("sub")
        user = self.user_repo.get_by_email(email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if user.is_verified:
            return {"message": "Email already verified"}

        self.user_repo.update(user, is_verified=True)
        return {"message": "Email verified successfully"}

    def forgot_password(self, email: str):
        user = self.user_repo.get_by_email(email)
        if not user:
            # Don't reveal if email exists
            return {"message": "If the email exists, a reset link has been sent"}

        token = create_password_reset_token(email)
        self.redis.setex(f"pwd_reset:{email}", 3600, token)
        self.email_service.send_password_reset_email(email, token)
        return {"message": "If the email exists, a reset link has been sent"}

    def reset_password(self, token: str, new_password: str):
        payload = decode_token(token)
        if not payload or payload.get("type") != "password_reset":
            raise HTTPException(status_code=400, detail="Invalid or expired token")

        email = payload.get("sub")
        stored = self.redis.get(f"pwd_reset:{email}")
        if not stored or stored != token:
            raise HTTPException(status_code=400, detail="Token already used or expired")

        user = self.user_repo.get_by_email(email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        hashed = get_password_hash(new_password)
        self.user_repo.update(user, hashed_password=hashed)
        self.redis.delete(f"pwd_reset:{email}")
        return {"message": "Password reset successfully"}
