from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.core.db import get_db
from app.core.security import require_roles
from app.models.succession import Succession
from app.models.employee import Employee
from app.models.role import Role
from app.schemas.succession import SuccessionList, SuccessionOut, SuccessionToggleIn
from app.core.security import require_roles

router = APIRouter(prefix="/succession", tags=["succession"])

@router.get("", response_model=SuccessionList, dependencies=[Depends(require_roles())])
def list_succession(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    per_page: int = Query(30, ge=1, le=200),
    target_role: str | None = None,
    division: str | None = None,
):
    stmt = select(Succession)
    if target_role:
        stmt = stmt.where(func.cast(Succession.target_role, func.TEXT) == target_role)
    if division:
        # через join по Role.division
        stmt = stmt.join(Role, Role.id == Succession.target_role).where(Role.division == division)

    total = db.scalar(select(func.count()).select_from(stmt.subquery()))
    stmt = stmt.order_by(Succession.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    items = db.scalars(stmt).all()
    out = [SuccessionOut.model_validate(i.__dict__) for i in items]
    return SuccessionList(items=out, page=page, per_page=per_page, total=total or 0)

@router.post("/toggle", response_model=SuccessionOut, dependencies=[Depends(require_roles("hr","admin","supervisor"))])
def toggle_star(payload: SuccessionToggleIn, db: Session = Depends(get_db)):
    # валидация FK: существующий сотрудник и роль
    if not db.get(Employee, payload.employee_id):
        raise HTTPException(status_code=404, detail="Employee not found")
    if not db.get(Role, payload.target_role):
        raise HTTPException(status_code=404, detail="Role not found")

    # найдём существующую запись пары (employee_id, target_role)
    stmt = select(Succession).where(
        Succession.employee_id == payload.employee_id,
        Succession.target_role == payload.target_role,
    )
    obj = db.scalars(stmt).first()

    if obj:
        obj.is_starred = payload.is_starred
        if payload.notes is not None:
            obj.notes = payload.notes
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return SuccessionOut.model_validate(obj.__dict__)
    else:
        # создаём новую запись (если is_starred=false, особого смысла нет, но поддержим)
        from uuid import uuid4
        new_obj = Succession(
            id=uuid4(),
            employee_id=payload.employee_id,
            target_role=payload.target_role,
            is_starred=payload.is_starred,
            notes=payload.notes or "",
        )
        db.add(new_obj)
        db.commit()
        db.refresh(new_obj)
        return SuccessionOut.model_validate(new_obj.__dict__)
