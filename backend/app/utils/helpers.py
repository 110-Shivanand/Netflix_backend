import re
import math


def slugify(text: str) -> str:
    """Convert a string to a URL-friendly slug."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    text = re.sub(r"^-+|-+$", "", text)
    return text


def paginate(total: int, page: int, page_size: int) -> dict:
    """Return pagination metadata."""
    total_pages = math.ceil(total / page_size) if page_size > 0 else 0
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


def format_duration(seconds: int) -> str:
    """Convert seconds to h:mm:ss or m:ss string."""
    if seconds is None:
        return "Unknown"
    h = seconds // 3600
    m = (seconds % 3600) // 60
    s = seconds % 60
    if h:
        return f"{h}h {m:02d}m"
    return f"{m}m {s:02d}s"


def allowed_video_type(content_type: str) -> bool:
    return content_type in ["video/mp4", "video/webm", "video/x-matroska", "video/quicktime"]


def allowed_image_type(content_type: str) -> bool:
    return content_type in ["image/jpeg", "image/png", "image/webp", "image/gif"]
