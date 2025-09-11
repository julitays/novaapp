from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.core.db import get_db
from app.core.security import require_roles
from app.models.employee import Employee
from app.schemas.org import OrgTreeResponse, OrgNode
from collections import defaultdict

router = APIRouter(prefix="/org", tags=["org"])

@router.get("/tree", response_model=OrgTreeResponse, dependencies=[Depends(require_roles())])
def org_tree(
    db: Session = Depends(get_db),
    dept: str | None = None,
    unit: str | None = None,
    manager: str | None = None,
    search: str | None = None,
):
    # базовый выбор сотрудников под фильтры
    stmt = select(Employee)
    if dept:
        stmt = stmt.where(Employee.department == dept)
    if unit:
        stmt = stmt.where(Employee.unit == unit)
    if manager:
        stmt = stmt.where(func.cast(Employee.manager_id, func.TEXT) == manager)
    if search:
        like = f"%{search}%"
        stmt = stmt.where(
            func.lower(Employee.name).like(func.lower(like)) |
            func.lower(Employee.email).like(func.lower(like)) |
            func.lower(Employee.title).like(func.lower(like))
        )

    emps = db.scalars(stmt).all()
    if not emps:
        return OrgTreeResponse(nodes={}, children={}, deptCounts={})

    # посчитаем span (число прямых репортов)
    # SELECT manager_id, COUNT(*) FROM employees WHERE ... GROUP BY manager_id;
    # (для простоты посчитаем в памяти по уже отфильтрованным сотрудникам)
    children = defaultdict(list)
    span = defaultdict(int)
    nodes = {}

    # предварительно соберем словарь по id строки
    for e in emps:
        eid = str(e.id)
        if e.manager_id:
            children[str(e.manager_id)].append(eid)
            span[str(e.manager_id)] += 1
        # создаём узел (span заполним после)
        nodes[eid] = OrgNode(
            id=e.id, name=e.name, title=e.title,
            department=e.department, unit=e.unit,
            manager_id=e.manager_id, span=0
        )

    # применяем span
    for mid, cnt in span.items():
        if mid in nodes:
            nodes[mid].span = cnt

    # посчитаем deptCounts по текущей выдаче
    dept_counts = defaultdict(int)
    for e in emps:
        if e.department:
            dept_counts[e.department] += 1

    # сериализация
    nodes_out = {k: nodes[k] for k in nodes.keys()}
    children_out = {k: v for k, v in children.items()}
    dept_out = dict(dept_counts)

    return OrgTreeResponse(nodes=nodes_out, children=children_out, deptCounts=dept_out)
