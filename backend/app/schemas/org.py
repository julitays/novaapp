from pydantic import BaseModel
from typing import Dict, List, Optional
from uuid import UUID

class OrgNode(BaseModel):
    id: UUID
    name: str
    title: str
    department: str
    unit: str
    manager_id: Optional[UUID] = None
    span: int

class OrgTreeResponse(BaseModel):
    nodes: Dict[str, OrgNode]
    children: Dict[str, List[str]]
    deptCounts: Dict[str, int]
