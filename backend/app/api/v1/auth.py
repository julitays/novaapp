from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.schemas.auth import LoginRequest, TokenPair, MeResponse
from app.core.security import create_access_token, create_refresh_token, verify_password
from app.core.config import settings
from app.core.db import get_db
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=TokenPair)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    # 1) Bootstrap-логин без БД (до любого запроса в БД)
    if payload.email == settings.ADMIN_EMAIL and payload.password == settings.ADMIN_PASSWORD:
        return TokenPair(
            access=create_access_token(payload.email),
            refresh=create_refresh_token(payload.email),
        )

    # 2) Пытаемся пойти в БД (если есть реальные пользователи)
    try:
        user = db.query(User).filter(User.email == payload.email).first()
    except SQLAlchemyError:
        # БД ещё не настроена — сообщаем честно и полезно
        raise HTTPException(
            status_code=503,
            detail="Auth temporarily unavailable: database not configured. "
                   "Use admin bootstrap creds from .env or set DB_URL to a working Postgres."
        )

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return TokenPair(
        access=create_access_token(user.email),
        refresh=create_refresh_token(user.email),
    )

@router.get("/me", response_model=MeResponse)
def me():
    # На MVP это заглушка — полноценный JWT-guard добавим позже
    return MeResponse(email=settings.ADMIN_EMAIL, role="admin")
