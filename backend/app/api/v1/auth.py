# app/api/v1/auth.py
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from app.schemas.auth import LoginRequest, TokenPair, MeResponse
from app.core.security import (
    create_access_token,
    create_refresh_token,
    verify_password,
    get_current_user,
)
from app.core.config import settings
from app.core.db import get_db
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])

def safe_verify(plain: str, hashed: str | None) -> bool:
    if not hashed or not isinstance(hashed, str):
        return False
    try:
        return verify_password(plain, hashed)
    except Exception:
        # например, хеш в неожиданном формате — считаем невалидным
        return False

@router.post("/login", response_model=TokenPair)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()

    # 0) Быстрый путь — админ из .env (обход БД, чтобы не ловить 500 из-за БД)
    if (
        settings.ADMIN_EMAIL
        and settings.ADMIN_PASSWORD
        and email == settings.ADMIN_EMAIL.strip().lower()
        and payload.password == settings.ADMIN_PASSWORD
    ):
        return TokenPair(
            access=create_access_token(email),
            refresh=create_refresh_token(email),
        )

    # 1) Основной путь — пользователь в БД
    user = db.query(User).filter(User.email == email).first()

    # 2) Проверка пароля — строго через safe_verify, чтобы не уронить сервер
    if not user or not safe_verify(payload.password, getattr(user, "password_hash", None)):
        # всегда одинаковый ответ — не раскрываем, существует ли email
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return TokenPair(
        access=create_access_token(user.email),
        refresh=create_refresh_token(user.email),
    )

@router.get("/me", response_model=MeResponse)
def me(current=Depends(get_current_user)):
    return MeResponse(email=current.email, role=current.role, is_active=current.is_active)

@router.post("/refresh", response_model=TokenPair)
def refresh(refresh_token: str):
    try:
        payload = jwt.decode(refresh_token, settings.JWT_SECRET, algorithms=[settings.ALGO])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        sub = payload.get("sub")
        if not sub:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    return TokenPair(access=create_access_token(sub), refresh=create_refresh_token(sub))
