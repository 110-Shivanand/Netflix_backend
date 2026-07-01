import io
import uuid
from typing import Optional, BinaryIO
from minio import Minio
from minio.error import S3Error
from app.core.config import settings


class MinioService:
    def __init__(self):
        self.client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=False,
        )
        self.bucket = settings.MINIO_BUCKET
        self._ensure_bucket()

    def _ensure_bucket(self):
        try:
            if not self.client.bucket_exists(self.bucket):
                self.client.make_bucket(self.bucket)
                # Make bucket publicly readable
                policy = f"""{{
                    "Version": "2012-10-17",
                    "Statement": [{{
                        "Effect": "Allow",
                        "Principal": {{"AWS": ["*"]}},
                        "Action": ["s3:GetObject"],
                        "Resource": ["arn:aws:s3:::{self.bucket}/*"]
                    }}]
                }}"""
                self.client.set_bucket_policy(self.bucket, policy)
        except Exception as e:
            print(f"[MinIO] Bucket setup error: {e}")

    def upload_file(
        self,
        file_data: bytes,
        content_type: str,
        folder: str = "misc",
        extension: str = "bin",
    ) -> str:
        """Upload a file and return its object key."""
        key = f"{folder}/{uuid.uuid4()}.{extension}"
        self.client.put_object(
            self.bucket,
            key,
            io.BytesIO(file_data),
            length=len(file_data),
            content_type=content_type,
        )
        return key

    def upload_stream(
        self,
        stream: BinaryIO,
        size: int,
        content_type: str,
        folder: str = "videos",
        extension: str = "mp4",
    ) -> str:
        key = f"{folder}/{uuid.uuid4()}.{extension}"
        self.client.put_object(
            self.bucket,
            key,
            stream,
            length=size,
            content_type=content_type,
        )
        return key

    def get_url(self, key: str) -> str:
        """Return public URL for a stored object."""
        return f"http://{settings.MINIO_ENDPOINT}/{self.bucket}/{key}"

    def delete_file(self, key: str):
        try:
            self.client.remove_object(self.bucket, key)
        except S3Error as e:
            print(f"[MinIO] Delete error: {e}")

    def get_object(self, key: str):
        return self.client.get_object(self.bucket, key)

    def stat_object(self, key: str):
        return self.client.stat_object(self.bucket, key)


minio_service = MinioService()
