from datetime import datetime, timedelta, timezone
from typing import Optional, Callable
from functools import wraps

from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings
from app.core.db import SessionLocal
from app.models.user import User

pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_PREFIX}/auth/login")

def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def _create_token(sub: str, ttl_minutes: int, token_type: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": sub,
        "type": token_type,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=ttl_minutes)).timestamp()),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.ALGO)

def create_access_token(sub: str) -> str:
    return _create_token(sub, settings.ACCESS_TTL_MIN, "access")

def create_refresh_token(sub: str) -> str:
    return _create_token(sub, settings.REFRESH_TTL_DAYS * 24 * 60, "refresh")

# ---- AuthN / AuthZ ----

def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """Проверяем JWT и отдаём юзера. 401 если токен битый/просрочен; 403 если юзер неактивен."""
    credentials_exc = HTTPException(status_code=401, detail="Invalid or expired token")
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.ALGO])
        if payload.get("type") != "access":
            raise credentials_exc
        email = payload.get("sub")
    except JWTError:
        raise credentials_exc

    # локальная сессия для запроса пользователя
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user or not user.is_active:
            raise HTTPException(status_code=403, detail="User inactive or not found")
        return user
    finally:
        db.close()

def require_roles(*allowed_roles: str):
    """
    Dependency: кладём в эндпоинт как Depends(require_roles("hr","admin"))
    Если список пуст — только проверка, что пользователь аутентифицирован.
    """
    def _dep(user: User = Depends(get_current_user)) -> User:
        if allowed_roles and user.role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Forbidden: insufficient role")
        return user
    return _dep
