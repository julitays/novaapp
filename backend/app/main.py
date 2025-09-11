from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import auth as auth_router
from app.api.v1 import employees as employees_router
from app.api.v1 import roles as roles_router
from app.api.v1 import succession as succession_router
from app.api.v1 import vacancies as vacancies_router
from app.api.v1 import org as org_router

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "env": settings.ENV}

app.include_router(auth_router.router, prefix=settings.API_V1_PREFIX)
app.include_router(employees_router.router, prefix=settings.API_V1_PREFIX)
app.include_router(roles_router.router, prefix=settings.API_V1_PREFIX)
app.include_router(succession_router.router, prefix=settings.API_V1_PREFIX)
app.include_router(vacancies_router.router, prefix=settings.API_V1_PREFIX)
app.include_router(org_router.router, prefix=settings.API_V1_PREFIX)
