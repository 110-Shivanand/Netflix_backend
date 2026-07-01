from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from uuid import UUID
from app.models.user import User, UserProfile, Role


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: UUID) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def get_by_username(self, username: str) -> Optional[User]:
        return self.db.query(User).filter(User.username == username).first()

    def get_by_email_or_username(self, identifier: str) -> Optional[User]:
        return self.db.query(User).filter(
            or_(User.email == identifier, User.username == identifier)
        ).first()

    def create(self, email: str, username: str, hashed_password: str, is_admin: bool = False) -> User:
        user = User(
            email=email,
            username=username,
            hashed_password=hashed_password,
            is_admin=is_admin,
        )
        self.db.add(user)
        self.db.flush()
        # Create empty profile
        profile = UserProfile(user_id=user.id)
        self.db.add(profile)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update(self, user: User, **kwargs) -> User:
        for key, value in kwargs.items():
            setattr(user, key, value)
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_all(self, skip: int = 0, limit: int = 20):
        return self.db.query(User).offset(skip).limit(limit).all()

    def count(self) -> int:
        return self.db.query(User).count()

    def delete(self, user: User):
        self.db.delete(user)
        self.db.commit()

    def update_profile(self, user_id: UUID, **kwargs) -> Optional[UserProfile]:
        profile = self.db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        if not profile:
            return None
        for key, value in kwargs.items():
            if value is not None:
                setattr(profile, key, value)
        self.db.commit()
        self.db.refresh(profile)
        return profile
