from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "NetFilms API"
    environment: str = "development"
    frontend_origin: str = "http://localhost:3000"
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Versioned API for the NetFilms Kinyarwanda movie platform.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.get("/api/v1/health", tags=["system"])
async def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "netfilms-api"}
