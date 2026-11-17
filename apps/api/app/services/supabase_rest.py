import httpx
from fastapi import HTTPException

from app.config import get_settings


async def select_rows(table: str, params: dict[str, str]) -> list[dict]:
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_anon_key:
        raise HTTPException(
            status_code=503,
            detail="The NetFilms catalogue database is not configured yet.",
        )

    url = f"{settings.supabase_url.rstrip('/')}/rest/v1/{table}"
    headers = {
        "apikey": settings.supabase_anon_key,
        "Authorization": f"Bearer {settings.supabase_anon_key}",
        "Accept": "application/json",
    }
    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            response = await client.get(url, params=params, headers=headers)
            response.raise_for_status()
            data = response.json()
            return data if isinstance(data, list) else []
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=502, detail="Catalogue database request failed.") from exc
    except httpx.RequestError as exc:
        raise HTTPException(status_code=503, detail="Catalogue database is temporarily unavailable.") from exc
