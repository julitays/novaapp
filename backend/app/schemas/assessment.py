from pydantic import BaseModel
from typing import Optional, Dict
from datetime import date, datetime
from uuid import UUID

class AssessmentOut(BaseModel):
    id: UUID
    employee_id: UUID
    role_id: Optional[UUID] = None
    date: date
    percent: float
    source: str
    payload: Dict
    created_at: Optional[datetime] = None

class AssessmentList(BaseModel):
    items: list[AssessmentOut]
    page: int
    per_page: int
    total: int
