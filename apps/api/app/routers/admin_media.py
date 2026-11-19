import asyncio
import re
import uuid
from pathlib import PurePath
from typing import Literal

import boto3
import httpx
from botocore.config import Config as BotoConfig
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field

from app.config import get_settings

router = APIRouter(prefix="/admin/media", tags=["admin media"])

MediaKind = Literal["video", "poster", "backdrop", "episode_thumbnail", "subtitle"]
EntityType = Literal["movie", "episode"]
ALLOWED_TYPES = {
    "video": {"video/mp4", "video/webm", "video/quicktime"},
    "poster": {"image/jpeg", "image/png", "image/webp"},
    "backdrop": {"image/jpeg", "image/png", "image/webp"},
    "episode_thumbnail": {"image/jpeg", "image/png", "image/webp"},
    "subtitle": {"text/vtt"},
}


class UploadIntent(BaseModel):
    filename: str = Field(min_length=1, max_length=180)
    content_type: str = Field(min_length=3, max_length=120)
    kind: MediaKind
    byte_size: int = Field(gt=0)
    subtitle_label: str | None = Field(default=None, min_length=1, max_length=80)
    subtitle_language: str | None = Field(default=None, min_length=2, max_length=35)


class UploadComplete(BaseModel):
    object_key: str = Field(min_length=1, max_length=500)
    kind: MediaKind
    entity_type: EntityType
    entity_id: uuid.UUID
    subtitle_label: str | None = Field(default=None, min_length=1, max_length=80)
    subtitle_language: str | None = Field(default=None, min_length=2, max_length=35)


def _r2_client():
    settings = get_settings()
    if not all((settings.r2_account_id, settings.r2_access_key_id, settings.r2_secret_access_key, settings.r2_bucket_name)):
        raise HTTPException(status_code=503, detail="Cloudflare R2 storage is not configured.")
    return boto3.client(
        "s3",
        endpoint_url=f"https://{settings.r2_account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=settings.r2_access_key_id,
        aws_secret_access_key=settings.r2_secret_access_key,
        region_name="auto",
        config=BotoConfig(signature_version="s3v4"),
    )


async def _admin_user(authorization: str | None) -> tuple[str, str]:
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_anon_key:
        raise HTTPException(status_code=503, detail="Supabase authentication is not configured.")
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="A signed-in administrator session is required.")
    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="A valid administrator session is required.")

    base = settings.supabase_url.rstrip("/")
    headers = {"apikey": settings.supabase_anon_key, "Authorization": f"Bearer {token}"}
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            user_response = await client.get(f"{base}/auth/v1/user", headers=headers)
            if user_response.status_code != 200:
                raise HTTPException(status_code=401, detail="Your sign-in session is invalid or expired.")
            user = user_response.json()
            user_id = user.get("id")
            if not user_id:
                raise HTTPException(status_code=401, detail="Your sign-in session is invalid.")
            membership_response = await client.get(
                f"{base}/rest/v1/admin_users",
                params={"select": "role,is_active", "user_id": f"eq.{user_id}", "is_active": "eq.true", "limit": "1"},
                headers=headers,
            )
            if membership_response.status_code != 200:
                raise HTTPException(status_code=403, detail="Administrator access could not be verified.")
            memberships = membership_response.json()
            if not memberships:
                raise HTTPException(status_code=403, detail="This account has no active NetFilms administrator role.")
            role = memberships[0].get("role", "")
            if role not in {"owner", "content_manager", "editor"}:
                raise HTTPException(status_code=403, detail="Your administrator role cannot manage media.")
            return str(user_id), token
    except httpx.RequestError as exc:
        raise HTTPException(status_code=503, detail="Authentication service is temporarily unavailable.") from exc


@router.post("/presign")
async def create_upload_url(
    intent: UploadIntent,
    authorization: str | None = Header(default=None),
):
    user_id, _ = await _admin_user(authorization)
    settings = get_settings()
    if intent.content_type.lower() not in ALLOWED_TYPES[intent.kind]:
        raise HTTPException(status_code=415, detail="This file type is not allowed for the selected media category.")
    if intent.byte_size > settings.upload_max_bytes:
        raise HTTPException(status_code=413, detail=f"File exceeds the {settings.upload_max_bytes // 1_000_000} MB upload limit.")

    extension = PurePath(intent.filename).suffix.lower()
    if not re.fullmatch(r"\.[a-z0-9]{1,8}", extension):
        extension = ""
    object_key = f"netfilms/{user_id}/{uuid.uuid4().hex}{extension}"
    client = _r2_client()
    try:
        upload_url = await asyncio.to_thread(
            client.generate_presigned_url,
            "put_object",
            Params={
                "Bucket": settings.r2_bucket_name,
                "Key": object_key,
                "ContentType": intent.content_type,
                "ContentLength": intent.byte_size,
            },
            ExpiresIn=600,
        )
    except (BotoCoreError, ClientError) as exc:
        raise HTTPException(status_code=502, detail="Could not prepare a secure media upload.") from exc

    return {
        "upload_url": upload_url,
        "object_key": object_key,
        "expires_in": 600,
        "required_headers": {"Content-Type": intent.content_type},
        "max_bytes": settings.upload_max_bytes,
    }


@router.post("/complete")
async def complete_upload(
    upload: UploadComplete,
    authorization: str | None = Header(default=None),
):
    user_id, token = await _admin_user(authorization)
    settings = get_settings()
    if upload.kind == "subtitle":
        if not upload.subtitle_label or not upload.subtitle_language:
            raise HTTPException(status_code=422, detail="Subtitle label and language are required.")
        if not re.fullmatch(r"[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*", upload.subtitle_language):
            raise HTTPException(status_code=422, detail="Enter a valid BCP 47 subtitle language code, such as rw or en.")
    if not upload.object_key.startswith(f"netfilms/{user_id}/"):
        raise HTTPException(status_code=403, detail="This upload does not belong to the signed-in administrator.")
    if upload.entity_type == "movie" and upload.kind not in {"video", "poster", "backdrop"}:
        raise HTTPException(status_code=422, detail="This media type cannot be attached to a movie.")
    if upload.entity_type == "episode" and upload.kind not in {"video", "episode_thumbnail", "subtitle"}:
        raise HTTPException(status_code=422, detail="This media type cannot be attached to an episode.")

    client = _r2_client()
    try:
        head = await asyncio.to_thread(
            client.head_object,
            Bucket=settings.r2_bucket_name,
            Key=upload.object_key,
        )
    except (BotoCoreError, ClientError) as exc:
        raise HTTPException(status_code=404, detail="The uploaded object could not be verified in storage.") from exc

    byte_size = int(head.get("ContentLength", 0))
    content_type = str(head.get("ContentType", ""))
    if byte_size <= 0 or byte_size > settings.upload_max_bytes:
        raise HTTPException(status_code=413, detail="The uploaded object has an invalid size.")
    if content_type not in ALLOWED_TYPES[upload.kind]:
        raise HTTPException(status_code=415, detail="The uploaded object content type does not match the media category.")

    base = settings.supabase_url.rstrip("/")
    headers = {
        "apikey": settings.supabase_anon_key or "",
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }
    asset_payload = {
        "kind": upload.kind,
        "r2_object_key": upload.object_key,
        "content_type": content_type,
        "byte_size": byte_size,
        "created_by": user_id,
        "subtitle_label": upload.subtitle_label if upload.kind == "subtitle" else None,
        "subtitle_language": upload.subtitle_language.lower() if upload.kind == "subtitle" and upload.subtitle_language else None,
    }
    try:
        async with httpx.AsyncClient(timeout=15.0) as http:
            asset_response = await http.post(f"{base}/rest/v1/media_assets", headers=headers, json=asset_payload)
            if asset_response.status_code not in (200, 201):
                raise HTTPException(status_code=502, detail="Storage succeeded, but the media record could not be saved.")
            asset_rows = asset_response.json()
            asset_id = asset_rows[0]["id"]
            relation_table = "movie_media" if upload.entity_type == "movie" else "episode_media"
            entity_column = "movie_id" if upload.entity_type == "movie" else "episode_id"
            relation_payload = {
                entity_column: str(upload.entity_id),
                "media_asset_id": asset_id,
                "kind": upload.kind,
            }
            relation_response = await http.post(
                f"{base}/rest/v1/{relation_table}",
                headers=headers,
                json=relation_payload,
            )
            if relation_response.status_code not in (200, 201):
                await http.delete(
                    f"{base}/rest/v1/media_assets",
                    params={"id": f"eq.{asset_id}"},
                    headers={**headers, "Prefer": "return=minimal"},
                )
                raise HTTPException(status_code=422, detail="The media record was saved but could not be linked to the selected title.")
    except httpx.RequestError as exc:
        raise HTTPException(status_code=503, detail="Could not save the uploaded media record.") from exc

    public_url = None
    if settings.r2_public_base_url:
        public_url = f"{settings.r2_public_base_url.rstrip('/')}/{upload.object_key}"
    return {"media_asset_id": asset_id, "object_key": upload.object_key, "kind": upload.kind, "byte_size": byte_size, "public_url": public_url}
