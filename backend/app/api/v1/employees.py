from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.core.db import get_db
from app.models.employee import Employee
from app.schemas.employee import EmployeeList, EmployeeOut

router = APIRouter(prefix="/employees", tags=["employees"])

@router.get("", response_model=EmployeeList)
def list_employees(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    per_page: int = Query(30, ge=1, le=200),
    search: str | None = None,
    role: str | None = None,   # на будущее (из title или join)
    dept: str | None = Query(None, alias="dept"),
    unit: str | None = None,
    manager: str | None = None # UUID строкой
):
    stmt = select(Employee)
    if search:
        like = f"%{search}%"
        stmt = stmt.where(func.lower(Employee.name).like(func.lower(like)) |
                          func.lower(Employee.email).like(func.lower(like)) |
                          func.lower(Employee.title).like(func.lower(like)))
    if dept:
        stmt = stmt.where(Employee.department == dept)
    if unit:
        stmt = stmt.where(Employee.unit == unit)
    if manager:
        # simple filter; фронт передаёт UUID строкой
        stmt = stmt.where(func.cast(Employee.manager_id, func.TEXT) == manager)

    total = db.scalar(select(func.count()).select_from(stmt.subquery()))
    stmt = stmt.order_by(Employee.name).offset((page - 1) * per_page).limit(per_page)
    items = db.scalars(stmt).all()
    return EmployeeList(
        items=[EmployeeOut.model_validate(i.__dict__) for i in items],
        page=page, per_page=per_page, total=total or 0
    )
