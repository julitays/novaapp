from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.core.db import get_db
from app.core.security import require_roles
from app.models.vacancy import Vacancy
from app.schemas.vacancy import VacancyList, VacancyOut

router = APIRouter(prefix="/vacancies", tags=["vacancies"])

@router.get("", response_model=VacancyList, dependencies=[Depends(require_roles())])
def list_vacancies(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    per_page: int = Query(30, ge=1, le=200),
    status: str | None = None,
    dept: str | None = None,
    unit: str | None = None,
    manager: str | None = None,
):
    stmt = select(Vacancy)
    if status:
        stmt = stmt.where(Vacancy.status == status)
    if dept:
        stmt = stmt.where(Vacancy.department == dept)
    if unit:
        stmt = stmt.where(Vacancy.unit == unit)
    if manager:
        stmt = stmt.where(func.cast(Vacancy.manager_id, func.TEXT) == manager)

    total = db.scalar(select(func.count()).select_from(stmt.subquery()))
    stmt = stmt.order_by(Vacancy.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    items = db.scalars(stmt).all()
    out = [VacancyOut.model_validate(i.__dict__) for i in items]
    return VacancyList(items=out, page=page, per_page=per_page, total=total or 0)
