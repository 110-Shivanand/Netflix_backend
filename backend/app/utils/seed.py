"""
Run this script once to seed initial data:
  docker exec -it netflix_backend python -m app.utils.seed
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User, UserProfile
from app.models.content import Genre


def seed():
    db = SessionLocal()
    try:
        # ── Create admin user ──────────────────────────────────
        existing_admin = db.query(User).filter(User.email == "admin@netflix.com").first()
        if not existing_admin:
            admin = User(
                email="admin@netflix.com",
                username="admin",
                hashed_password=get_password_hash("Admin@123456"),
                is_admin=True,
                is_active=True,
                is_verified=True,
            )
            db.add(admin)
            db.flush()
            profile = UserProfile(user_id=admin.id, full_name="Administrator")
            db.add(profile)
            print("✓ Admin user created: admin@netflix.com / Admin@123456")
        else:
            print("- Admin user already exists")

        # ── Create genres ──────────────────────────────────────
        genres = [
            ("Action", "action"),
            ("Comedy", "comedy"),
            ("Drama", "drama"),
            ("Horror", "horror"),
            ("Thriller", "thriller"),
            ("Sci-Fi", "sci-fi"),
            ("Romance", "romance"),
            ("Animation", "animation"),
            ("Documentary", "documentary"),
            ("Crime", "crime"),
            ("Fantasy", "fantasy"),
            ("Adventure", "adventure"),
        ]
        for name, slug in genres:
            if not db.query(Genre).filter(Genre.slug == slug).first():
                db.add(Genre(name=name, slug=slug))
                print(f"✓ Genre created: {name}")

        db.commit()
        print("\nSeeding complete!")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
