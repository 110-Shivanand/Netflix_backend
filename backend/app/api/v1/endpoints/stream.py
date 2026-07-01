from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File
from fastapi.responses import StreamingResponse, Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.middleware.auth_middleware import get_current_admin
from app.repositories.content_repository import MovieRepository, EpisodeRepository
from app.services.minio_service import minio_service
from app.utils.helpers import allowed_video_type
from app.models.user import User
import re

router = APIRouter(prefix="/stream", tags=["Streaming"])

CHUNK_SIZE = 1024 * 1024  # 1MB chunks


@router.get("/movie/{movie_id}")
def stream_movie(movie_id: str, request: Request, db: Session = Depends(get_db)):
    """Stream movie via byte-range requests for seek support."""
    repo = MovieRepository(db)
    movie = repo.get_by_id(movie_id)
    if not movie or not movie.video_key:
        raise HTTPException(status_code=404, detail="Video not found")

    try:
        stat = minio_service.stat_object(movie.video_key)
        file_size = stat.size
    except Exception:
        raise HTTPException(status_code=404, detail="Video file not found in storage")

    range_header = request.headers.get("Range")
    if range_header:
        # Parse range: bytes=start-end
        match = re.match(r"bytes=(\d+)-(\d*)", range_header)
        if match:
            start = int(match.group(1))
            end = int(match.group(2)) if match.group(2) else file_size - 1
            end = min(end, file_size - 1)
            length = end - start + 1

            def stream_range():
                obj = minio_service.get_object(movie.video_key)
                obj.read(start)  # skip to start
                remaining = length
                while remaining > 0:
                    chunk_size = min(CHUNK_SIZE, remaining)
                    data = obj.read(chunk_size)
                    if not data:
                        break
                    remaining -= len(data)
                    yield data

            headers = {
                "Content-Range": f"bytes {start}-{end}/{file_size}",
                "Accept-Ranges": "bytes",
                "Content-Length": str(length),
                "Content-Type": "video/mp4",
            }
            repo.increment_views(movie_id)
            return Response(
                content=b"".join(stream_range()),
                status_code=206,
                headers=headers,
                media_type="video/mp4",
            )

    # Full file response
    def stream_full():
        obj = minio_service.get_object(movie.video_key)
        while True:
            data = obj.read(CHUNK_SIZE)
            if not data:
                break
            yield data

    repo.increment_views(movie_id)
    return StreamingResponse(
        stream_full(),
        media_type="video/mp4",
        headers={"Accept-Ranges": "bytes", "Content-Length": str(file_size)},
    )


@router.get("/episode/{episode_id}")
def stream_episode(episode_id: str, request: Request, db: Session = Depends(get_db)):
    """Stream episode with byte-range support."""
    repo = EpisodeRepository(db)
    episode = repo.get_by_id(episode_id)
    if not episode or not episode.video_key:
        raise HTTPException(status_code=404, detail="Video not found")

    try:
        stat = minio_service.stat_object(episode.video_key)
        file_size = stat.size
    except Exception:
        raise HTTPException(status_code=404, detail="Video file not found in storage")

    range_header = request.headers.get("Range")
    if range_header:
        match = re.match(r"bytes=(\d+)-(\d*)", range_header)
        if match:
            start = int(match.group(1))
            end = int(match.group(2)) if match.group(2) else file_size - 1
            end = min(end, file_size - 1)
            length = end - start + 1

            obj = minio_service.get_object(episode.video_key)
            obj.read(start)
            data = obj.read(length)

            headers = {
                "Content-Range": f"bytes {start}-{end}/{file_size}",
                "Accept-Ranges": "bytes",
                "Content-Length": str(length),
                "Content-Type": "video/mp4",
            }
            repo.increment_views(episode_id)
            return Response(content=data, status_code=206, headers=headers, media_type="video/mp4")

    def stream_full():
        obj = minio_service.get_object(episode.video_key)
        while True:
            data = obj.read(CHUNK_SIZE)
            if not data:
                break
            yield data

    repo.increment_views(episode_id)
    return StreamingResponse(
        stream_full(),
        media_type="video/mp4",
        headers={"Accept-Ranges": "bytes", "Content-Length": str(file_size)},
    )


@router.post("/movie/{movie_id}/upload")
async def upload_movie_video(
    movie_id: str,
    file: UploadFile = File(...),
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Admin: Upload a movie video to MinIO."""
    if not allowed_video_type(file.content_type):
        raise HTTPException(status_code=400, detail="Only video files are allowed (MP4, WebM, MKV)")

    repo = MovieRepository(db)
    movie = repo.get_by_id(movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    contents = await file.read()
    key = minio_service.upload_file(contents, file.content_type, folder="movies", extension="mp4")
    url = minio_service.get_url(key)

    # Remove old video if exists
    if movie.video_key:
        minio_service.delete_file(movie.video_key)

    repo.update(movie, video_url=url, video_key=key)
    return {"message": "Video uploaded successfully", "video_url": url}
