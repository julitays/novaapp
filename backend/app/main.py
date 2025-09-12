# app/main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse


from app.core.config import settings
from app.api.v1 import auth as auth_router
from app.api.v1 import employees as employees_router
from app.api.v1 import roles as roles_router
from app.api.v1 import succession as succession_router
from app.api.v1 import vacancies as vacancies_router
from app.api.v1 import org as org_router
from app.api.v1 import files as files_router

import os
import time
from sqlalchemy import text
from app.core.db import engine

app = FastAPI(title=settings.APP_NAME)

# ── Static /media
media_dir = os.environ.get("MEDIA_DIR", "/app/media")
os.makedirs(media_dir, exist_ok=True)
app.mount("/media", StaticFiles(directory=media_dir), name="media")

# ── CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Лёгкий access-лог для долгих запросов
@app.middleware("http")
async def access_log(request: Request, call_next):
    t0 = time.perf_counter()
    try:
        response = await call_next(request)
        return response
    finally:
        dt = (time.perf_counter() - t0) * 1000
        if dt > 300:
            print(f"[ACCESS] {request.method} {request.url.path} -> {int(dt)} ms")

# ── Health
@app.get("/health")
def health():
    return {"status": "ok", "env": settings.ENV}

@app.get("/healthz")
def healthz():
    # alias под привычное имя
    return {"status": "ok", "env": settings.ENV}

@app.get("/dbz")
def dbz():
    try:
        with engine.connect() as conn:
            conn.exec_driver_sql("SET LOCAL statement_timeout = 3000")
            conn.exec_driver_sql("SELECT 1")
        return {"db": "ok"}
    except Exception as e:
        print("[DBZ ERROR]", repr(e))
        return JSONResponse(status_code=503, content={"db": "down", "error": str(e)[:200]})

# ── API v1
app.include_router(auth_router.router, prefix=settings.API_V1_PREFIX)
app.include_router(employees_router.router, prefix=settings.API_V1_PREFIX)
app.include_router(roles_router.router, prefix=settings.API_V1_PREFIX)
app.include_router(succession_router.router, prefix=settings.API_V1_PREFIX)
app.include_router(vacancies_router.router, prefix=settings.API_V1_PREFIX)
app.include_router(org_router.router, prefix=settings.API_V1_PREFIX)
app.include_router(files_router.router, prefix=settings.API_V1_PREFIX)
