import asyncio

import boto3
from botocore.config import Config as BotoConfig
from fastapi import APIRouter, HTTPException, Query

from app.config import get_settings
from app.services.supabase_rest import select_rows

router = APIRouter()


@router.get("/movies")
async def list_movies(
    search: str | None = Query(default=None, max_length=120),
    limit: int = Query(default=24, ge=1, le=60),
    offset: int = Query(default=0, ge=0),
):
    params = {
        "select": "id,slug,title,description,release_year,duration_seconds,video_quality,published_at,kind,movie_translators(translators(id,slug,full_name)),movie_parts(part_number,collection_id),movie_genres(genres(name)),movie_media(kind,media_assets(external_url,r2_object_key,content_type))",
        "status": "eq.published",
        "order": "published_at.desc.nullslast",
        "limit": str(limit),
        "offset": str(offset),
    }
    if search:
        safe_search = search.replace(",", " ").replace("%", "")
        params["or"] = f"(title.ilike.*{safe_search}*)"
    return await select_rows("movies", params)


@router.get("/translators")
async def list_translators(
    search: str | None = Query(default=None, max_length=120),
    limit: int = Query(default=40, ge=1, le=100),
):
    params = {
        "select": "id,slug,full_name,biography,profile_photo_url,movie_translators(count)",
        "is_active": "eq.true",
        "order": "full_name.asc",
        "limit": str(limit),
    }
    if search:
        safe_search = search.replace(",", " ").replace("%", "")
        params["full_name"] = f"ilike.*{safe_search}*"
    return await select_rows("translators", params)


@router.get("/series")
async def list_series(limit: int = Query(default=24, ge=1, le=60)):
    return await select_rows(
        "series",
        {
            "select": "id,slug,title,description,release_year,seasons(id,season_number,episodes(id,episode_number,title,duration_seconds,episode_translators(translators(id,slug,full_name))))",
            "status": "eq.published",
            "order": "title.asc",
            "limit": str(limit),
        },
    )

def _first(value):
    if isinstance(value, list):
        return value[0] if value else None
    return value if isinstance(value, dict) else None


@router.get("/movies/{slug}/playback")
async def get_movie_playback(slug: str):
    rows = await select_rows(
        "movies",
        {
            "select": "id,slug,title,status,rights_holder,rights_reference,rights_verified_at,movie_translators(translator_id),movie_media(kind,media_assets(kind,external_url,r2_object_key,content_type))",
            "slug": f"eq.{slug}",
            "status": "eq.published",
            "limit": "1",
        },
    )
    if not rows:
        raise HTTPException(status_code=404, detail="This movie is not available.")
    movie = rows[0]
    if not (movie.get("rights_holder") and movie.get("rights_reference") and movie.get("rights_verified_at")):
        raise HTTPException(status_code=403, detail="Distribution rights have not been verified for this title.")
    if not movie.get("movie_translators"):
        raise HTTPException(status_code=403, detail="A translator credit is required before playback.")

    video_asset = None
    for link in movie.get("movie_media") or []:
        if link.get("kind") == "video":
            asset = _first(link.get("media_assets"))
            if asset and asset.get("kind") == "video":
                video_asset = asset
                break
    if not video_asset:
        raise HTTPException(status_code=404, detail="A video source has not been added to this movie yet.")

    external_url = video_asset.get("external_url")
    if external_url:
        if not str(external_url).startswith("https://"):
            raise HTTPException(status_code=403, detail="The configured video source must use HTTPS.")
        return {"title": movie["title"], "src": external_url, "content_type": video_asset.get("content_type")}

    object_key = video_asset.get("r2_object_key")
    settings = get_settings()
    if not object_key or not all((settings.r2_account_id, settings.r2_access_key_id, settings.r2_secret_access_key, settings.r2_bucket_name)):
        raise HTTPException(status_code=503, detail="Secure video delivery is not configured.")
    storage = boto3.client(
        "s3",
        endpoint_url=f"https://{settings.r2_account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=settings.r2_access_key_id,
        aws_secret_access_key=settings.r2_secret_access_key,
        region_name="auto",
        config=BotoConfig(signature_version="s3v4"),
    )
    try:
        signed_url = await asyncio.to_thread(
            storage.generate_presigned_url,
            "get_object",
            Params={"Bucket": settings.r2_bucket_name, "Key": object_key},
            ExpiresIn=14400,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Could not prepare secure video playback.") from exc
    return {"title": movie["title"], "src": signed_url, "content_type": video_asset.get("content_type")}
