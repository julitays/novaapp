# app/core/config.py
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Union

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    APP_NAME: str = "NovaProfile API"
    API_V1_PREFIX: str = "/api/v1"
    ENV: str = "dev"
    DEBUG: bool = True

    CORS_ORIGINS: Union[List[str], str] = "http://localhost:5173"

    # ← ключевая строка: берём DATABASE_URL из .env, но в коде оставляем settings.DB_URL
    DB_URL: str = Field(
        default="postgresql+psycopg://postgres:postgres@localhost:5432/postgres",
        validation_alias="DATABASE_URL",
    )

    JWT_SECRET: str = "change-me-dev-secret-please"
    ACCESS_TTL_MIN: int = 15
    REFRESH_TTL_DAYS: int = 7
    ALGO: str = "HS256"

    STORAGE_URL_BASE: str = "https://YOUR_REF.supabase.co/storage/v1"
    STORAGE_PUBLIC_URL: str = "https://YOUR_REF.supabase.co/storage/v1/object/public"
    STORAGE_BUCKET: str = "avatars"
    STORAGE_SERVICE_KEY: str = "changeme"

    ADMIN_EMAIL: str = "admin@example.com"
    ADMIN_PASSWORD: str = "Admin123!"

settings = Settings()
