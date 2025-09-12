from pydantic import BaseModel, EmailStr
from typing import Optional, Dict
from datetime import date
from uuid import UUID

class EmployeeOut(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    title: str
    department: str
    unit: str
    region: str
    manager_id: Optional[UUID] = None
    avatar_url: Optional[str] = None
    bio: str
    languages: Dict[str, str]
    contacts: Dict[str, str]
    current_role_started_at: Optional[date] = None
    competencies: Dict[str, int]
    assessments_count: int

class EmployeeList(BaseModel):
    items: list[EmployeeOut]
    page: int
    per_page: int
    total: int
