from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers.public import router as public_router
from app.routers.admin_media import router as admin_media_router

settings = get_settings()
app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Public catalogue API for NetFilms — Movies in Kinyarwanda.",
    docs_url="/docs" if settings.environment != "production" else None,
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
)


@app.get("/health", tags=["system"])
@app.get(f"{settings.api_prefix}/health", tags=["system"])
async def health():
    return {
        "status": "ok",
        "service": "netfilms-api",
        "database_configured": bool(settings.supabase_url and settings.supabase_anon_key),
    }


app.include_router(public_router, prefix=settings.api_prefix, tags=["public catalogue"])
app.include_router(admin_media_router, prefix=settings.api_prefix)
