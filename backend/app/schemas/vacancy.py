from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class VacancyOut(BaseModel):
    id: UUID
    role_id: UUID
    department: str
    unit: str
    manager_id: Optional[UUID] = None
    status: str
    headcount: int
    location: str
    notes: str
    created_at: datetime
    updated_at: Optional[datetime] = None

class VacancyList(BaseModel):
    items: list[VacancyOut]
    page: int
    per_page: int
    total: int
