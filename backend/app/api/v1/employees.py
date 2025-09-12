from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import UUID4  # на будущее, если понадобится строгая валидация UUID4
from starlette.status import HTTP_404_NOT_FOUND

from sqlalchemy.orm import Session
from sqlalchemy import select, func, cast, String

from uuid import UUID

from app.core.security import require_roles
from app.core.db import get_db
from app.models.employee import Employee
from app.models.assessment import Assessment
from app.schemas.assessment import AssessmentList, AssessmentOut
from app.schemas.employee import EmployeeList, EmployeeOut

router = APIRouter(prefix="/employees", tags=["employees"])


@router.get("", response_model=EmployeeList, dependencies=[Depends(require_roles())])
def list_employees(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    per_page: int = Query(30, ge=1, le=200),
    search: str | None = None,
    role: str | None = None,   # на будущее (из title или join)
    dept: str | None = Query(None, alias="dept"),
    unit: str | None = None,
    manager: str | None = None  # UUID строкой
):
    stmt = select(Employee)

    if search:
        like = f"%{search}%"
        stmt = stmt.where(
            func.lower(Employee.name).like(func.lower(like)) |
            func.lower(Employee.email).like(func.lower(like)) |
            func.lower(Employee.title).like(func.lower(like))
        )
    if dept:
        stmt = stmt.where(Employee.department == dept)
    if unit:
        stmt = stmt.where(Employee.unit == unit)
    if manager:
        # фильтр по менеджеру: сравниваем UUID как строку
        stmt = stmt.where(cast(Employee.manager_id, String) == manager)

    total = db.scalar(select(func.count()).select_from(stmt.subquery()))
    stmt = stmt.order_by(Employee.name).offset((page - 1) * per_page).limit(per_page)
    items = db.scalars(stmt).all()

    return EmployeeList(
        items=[EmployeeOut.model_validate(i, from_attributes=True) for i in items],
        page=page,
        per_page=per_page,
        total=total or 0,
    )


@router.get("/{employee_id}", response_model=EmployeeOut, dependencies=[Depends(require_roles())])
def get_employee(employee_id: UUID, db: Session = Depends(get_db)):
    obj = db.get(Employee, employee_id)
    if not obj:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Employee not found")
    return EmployeeOut.model_validate(obj, from_attributes=True)


@router.get("/{employee_id}/assessments", response_model=AssessmentList, dependencies=[Depends(require_roles())])
def list_employee_assessments(
    employee_id: UUID,
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    per_page: int = Query(30, ge=1, le=200),
):
    # чёткая 404, если сотрудника нет
    exists = db.get(Employee, employee_id)
    if not exists:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Employee not found")

    base = select(Assessment).where(Assessment.employee_id == employee_id)
    total = db.scalar(select(func.count()).select_from(base.subquery()))
    stmt = base.order_by(Assessment.date.desc()).offset((page - 1) * per_page).limit(per_page)
    items = db.scalars(stmt).all()

    out = [AssessmentOut.model_validate(i, from_attributes=True) for i in items]
    return AssessmentList(items=out, page=page, per_page=per_page, total=total or 0)
