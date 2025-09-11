from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime
from uuid import UUID

class RoleOut(BaseModel):
    id: UUID
    name: str
    version: int
    division: str
    status: str
    goal: str
    responsibilities: Dict | None = None
    kpi: Dict | None = None
    competency_map: Dict | None = None
    assessment_guidelines: Dict | None = None
    test_assignment: Dict | None = None
    assessment_center: Dict | None = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class RoleList(BaseModel):
    items: list[RoleOut]
    page: int
    per_page: int
    total: int
