from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, field_validator
from typing import List

class Settings(BaseSettings):
    # Core
    APP_NAME: str = "NovaProfile API"
    API_V1_PREFIX: str = "/api/v1"
    ENV: str = "dev"
    DEBUG: bool = True

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173"]

    # DB
    DB_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/postgres"

    # Auth
    JWT_SECRET: str = "change-me-dev-secret-please"
    ACCESS_TTL_MIN: int = 15
    REFRESH_TTL_DAYS: int = 7
    ALGO: str = "HS256"

    # Admin bootstrapping (для простого логина на MVP)
    ADMIN_EMAIL: str = "admin@example.com"
    ADMIN_PASSWORD: str = "Admin123!"

    @field_validator("CORS_ORIGINS", mode="before")
    def split_cors(cls, v):
        if isinstance(v, str):
            return [s.strip() for s in v.split(",") if s.strip()]
        return v

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
