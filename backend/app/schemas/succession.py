from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class SuccessionToggleIn(BaseModel):
    employee_id: UUID
    target_role: UUID
    is_starred: bool
    notes: Optional[str] = ""

class SuccessionOut(BaseModel):
    id: UUID
    employee_id: UUID
    target_role: UUID
    is_starred: bool
    notes: str
    created_at: datetime

class SuccessionList(BaseModel):
    items: list[SuccessionOut]
    page: int
    per_page: int
    total: int
