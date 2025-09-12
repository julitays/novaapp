# app/core/db.py
from __future__ import annotations

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings

class Base(DeclarativeBase):
    pass

# Под Supabase (psycopg3): жёсткие таймауты + TLS + лимит на длительность SQL
CONNECT_ARGS = {
    "connect_timeout": 5,                           # сек на установку соединения
    "sslmode": "require",                           # обязательный TLS
    "options": "-c statement_timeout=8000 -c timezone=UTC",  # 8с на любой SQL
}

engine = create_engine(
    settings.DB_URL,        # ожидается postgresql+psycopg://...&sslmode=require
    pool_pre_ping=True,     # проверяем соединение из пула перед использованием
    pool_size=5,
    max_overflow=10,
    pool_timeout=10,        # макс. ожидание свободного коннекта из пула (сек)
    future=True,
    connect_args=CONNECT_ARGS,
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    future=True,
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
