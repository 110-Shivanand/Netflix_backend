from pydantic import BaseModel, EmailStr, UUID4
from typing import Optional
from datetime import datetime


class UserRegister(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: UUID4
    email: str
    username: str
    is_active: bool
    is_verified: bool
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserProfileResponse(BaseModel):
    id: UUID4
    user_id: UUID4
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    country: Optional[str] = None

    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    country: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class EmailVerifyRequest(BaseModel):
    token: str
