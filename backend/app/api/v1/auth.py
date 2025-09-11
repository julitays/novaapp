from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.schemas.auth import LoginRequest, TokenPair, MeResponse
from app.core.security import create_access_token, create_refresh_token, verify_password, hash_password, get_current_user
from app.core.config import settings
from app.core.db import get_db
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=TokenPair)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        # MVP-логин админом из env при первом заходе
        if payload.email == settings.ADMIN_EMAIL and payload.password == settings.ADMIN_PASSWORD:
            return TokenPair(access=create_access_token(payload.email),
                             refresh=create_refresh_token(payload.email))
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return TokenPair(access=create_access_token(user.email),
                     refresh=create_refresh_token(user.email))

@router.get("/me", response_model=MeResponse)
def me(current = Depends(get_current_user)):
    return MeResponse(email=current.email, role=current.role, is_active=current.is_active)

@router.post("/refresh", response_model=TokenPair)
def refresh(refresh_token: str):
    # Простой refresh: принимаем refresh JWT строкой и, если валиден (type=refresh), выдаём новую пару.
    from jose import jwt, JWTError
    try:
        payload = jwt.decode(refresh_token, settings.JWT_SECRET, algorithms=[settings.ALGO])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        sub = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    return TokenPair(access=create_access_token(sub), refresh=create_refresh_token(sub))
