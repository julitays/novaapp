from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")

def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_token(sub: str, ttl_minutes: int) -> str:
    now = datetime.now(timezone.utc)
    payload = {"sub": sub, "iat": int(now.timestamp()), "exp": int((now + timedelta(minutes=ttl_minutes)).timestamp())}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.ALGO)

def create_access_token(sub: str) -> str:
    return create_token(sub, settings.ACCESS_TTL_MIN)

def create_refresh_token(sub: str) -> str:
    return create_token(sub, settings.REFRESH_TTL_DAYS * 24 * 60)
