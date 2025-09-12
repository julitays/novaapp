# app/db/session.py
import os
import ssl
from typing import Tuple, Dict, Any

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.engine import make_url, URL

from app.core.config import settings


def _normalize_and_extract_ssl(raw_url: str) -> Tuple[str, Dict[str, Any]]:
    """
    Превращает sync-DSN в async-DSN и выносит sslmode (из URL) в connect_args['ssl']
    для asyncpg. Поведение сопоставлено с libpq:

      - sslmode=disable|allow|prefer  -> без TLS (ssl=False)
      - sslmode=require               -> TLS без валидации цепочки (encrypt-only)
      - sslmode=verify-ca             -> TLS c проверкой цепочки CA, без проверки hostname
      - sslmode=verify-full           -> TLS c проверкой цепочки CA и hostname

    Также поддерживает кастомный корневой сертификат через:
      - settings.DB_SSL_ROOT_CERT
      - или переменные окружения: PGSSLROOTCERT / SSL_ROOT_CERT
    """
    url = make_url(raw_url)

    # Нормализуем драйвер (postgres/sqlite → async-версии)
    driver = url.drivername
    if driver.startswith("postgresql+asyncpg"):
        new_driver = driver
    elif driver.startswith("postgresql"):
        new_driver = "postgresql+asyncpg"
    elif driver.startswith("sqlite"):
        new_driver = "sqlite+aiosqlite"
    else:
        new_driver = driver  # оставим как есть для кастомов

    # Забираем query и вынимаем sslmode
    query = dict(url.query) if url.query else {}
    sslmode = (query.pop("sslmode", None) or "").lower().strip()

    connect_args: Dict[str, Any] = {}

    # Путь к root CA (если задан)
    root_cert = (
        getattr(settings, "DB_SSL_ROOT_CERT", None)
        or os.environ.get("PGSSLROOTCERT")
        or os.environ.get("SSL_ROOT_CERT")
    )

    def _ctx_with_ca() -> ssl.SSLContext:
        # Создаём SSLContext с заданным CA (если есть), иначе дефолтный
        if root_cert and os.path.exists(root_cert):
            return ssl.create_default_context(cafile=root_cert)
        return ssl.create_default_context()

    # Маппинг sslmode → asyncpg ssl
    if new_driver.startswith("postgresql+asyncpg"):
        if sslmode in ("", "disable", "allow", "prefer"):
            # как в libpq: prefer/allow/disable — допускают/предпочитают,
            # но здесь включаемся по-простому без TLS
            connect_args["ssl"] = False
        elif sslmode == "require":
            # Шифруем, но НЕ валидируем цепочку (аналог libpq require)
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            connect_args["ssl"] = ctx
        elif sslmode in ("verify-ca", "verify_full", "verify-full"):
            # Строгие режимы
            ctx = _ctx_with_ca()
            if sslmode == "verify-ca":
                # проверяем цепочку, но не hostname
                ctx.check_hostname = False
            # verify-full — hostname проверяется по умолчанию
            connect_args["ssl"] = ctx
        else:
            # На неизвестное — безопасный дефолт: шифруем без валидации
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            connect_args["ssl"] = ctx

    new_url = URL.create(
        drivername=new_driver,
        username=url.username,
        password=url.password,
        host=url.host,
        port=url.port,
        database=url.database,
        query=query or None,  # sslmode убрали из URL
    )
    return str(new_url), connect_args


def _default_sqlite_url() -> str:
    # Локальный SQLite для дев-режима по умолчанию
    db_path = os.path.join(os.getcwd(), "app.db")
    return f"sqlite:///{db_path}"


# Берём DSN из настроек; если пусто — SQLite
raw_url = (getattr(settings, "DB_URL", None) or "").strip()
if not raw_url:
    raw_url = _default_sqlite_url()

ASYNC_DB_URL, CONNECT_ARGS = _normalize_and_extract_ssl(raw_url)

# Страхуемся: если остался sync-sqlite — переводим в async
if ASYNC_DB_URL.startswith("sqlite:///"):
    ASYNC_DB_URL = ASYNC_DB_URL.replace("sqlite:///", "sqlite+aiosqlite:///")

# Создаём async-движок
engine = create_async_engine(
    ASYNC_DB_URL,
    future=True,
    pool_pre_ping=True,
    connect_args=CONNECT_ARGS or None,
)

# Фабрика сессий
SessionLocal = async_sessionmaker(
    engine,
    expire_on_commit=False,
    class_=AsyncSession,
)


# DI-генератор для FastAPI
async def get_session() -> AsyncSession:
    async with SessionLocal() as session:
        yield session
