from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Core
    APP_NAME: str = "NovaProfile API"
    API_V1_PREFIX: str = "/api/v1"
    ENV: str = "dev"
    DEBUG: bool = True

    # CORS — допускаем строку или список
    CORS_ORIGINS: Union[List[str], str] = "http://localhost:5173"

    # DB
    DB_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/postgres"

    # Auth
    JWT_SECRET: str = "change-me-dev-secret-please"
    ACCESS_TTL_MIN: int = 15
    REFRESH_TTL_DAYS: int = 7
    ALGO: str = "HS256"

    # Admin bootstrapping (MVP)
    ADMIN_EMAIL: str = "admin@example.com"
    ADMIN_PASSWORD: str = "Admin123!"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            s = v.strip()
            # если это JSON-массив
            if s.startswith("[") and s.endswith("]"):
                import json
                return json.loads(s)
            # иначе — строка через запятую
            return [p.strip() for p in s.split(",") if p.strip()]
        return ["http://localhost:5173"]

settings = Settings()
