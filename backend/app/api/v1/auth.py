from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.schemas.auth import LoginRequest, TokenPair, MeResponse
from app.core.security import create_access_token, create_refresh_token, verify_password, hash_password
from app.core.config import settings
from app.core.db import get_db
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=TokenPair)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        # Позволим MVP-логин админом из env при первом запуске
        if payload.email == settings.ADMIN_EMAIL and payload.password == settings.ADMIN_PASSWORD:
            return TokenPair(access=create_access_token(payload.email),
                             refresh=create_refresh_token(payload.email))
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return TokenPair(access=create_access_token(user.email),
                     refresh=create_refresh_token(user.email))

@router.get("/me", response_model=MeResponse)
def me():
    # На MVP отдадим заглушку (подключим JWT-guard на Фазе 5/8)
    return MeResponse(email=settings.ADMIN_EMAIL, role="admin")
