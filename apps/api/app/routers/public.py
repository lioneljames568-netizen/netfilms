from fastapi import APIRouter, Query

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
