from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from uuid import UUID
from app.core.security import require_roles
from app.core.db import get_db
from app.models.role import Role
from app.schemas.role import RoleList, RoleOut

router = APIRouter(prefix="/roles", tags=["roles"])

@router.get("", response_model=RoleList, dependencies=[Depends(require_roles())])
def list_roles(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    per_page: int = Query(30, ge=1, le=200),
    search: str | None = None,
    division: str | None = None,
    status: str | None = None
):
    stmt = select(Role)
    if search:
        like = f"%{search}%"
        # по name и goal
        stmt = stmt.where(func.lower(Role.name).like(func.lower(like)) | func.lower(Role.goal).like(func.lower(like)))
    if division:
        stmt = stmt.where(Role.division == division)
    if status:
        stmt = stmt.where(Role.status == status)

    total = db.scalar(select(func.count()).select_from(stmt.subquery()))
    stmt = stmt.order_by(Role.name.asc(), Role.version.desc()).offset((page - 1) * per_page).limit(per_page)
    items = db.scalars(stmt).all()
    out = [RoleOut.model_validate(i.__dict__) for i in items]
    return RoleList(items=out, page=page, per_page=per_page, total=total or 0)

@router.get("/{role_id}", response_model=RoleOut, dependencies=[Depends(require_roles())])
def get_role(role_id: UUID, db: Session = Depends(get_db)):
    obj = db.get(Role, role_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Role not found")
    return RoleOut.model_validate(obj.__dict__)
