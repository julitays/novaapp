import uuid
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from sqlalchemy import String, Text, JSON, Integer, Enum, DateTime
from sqlalchemy.sql import func
from app.core.db import Base
import enum

class RoleStatus(str, enum.Enum):
    draft = "draft"
    active = "active"
    archived = "archived"

class Role(Base):
    __tablename__ = "roles"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), index=True)
    version: Mapped[int] = mapped_column(Integer, default=1)
    division: Mapped[str] = mapped_column(String(255), index=True, default="")
    status: Mapped[RoleStatus] = mapped_column(Enum(RoleStatus), default=RoleStatus.active)
    goal: Mapped[str] = mapped_column(Text, default="")
    responsibilities: Mapped[dict] = mapped_column(JSON, default=dict)
    kpi: Mapped[dict] = mapped_column(JSON, default=dict)
    competency_map: Mapped[dict] = mapped_column(JSON, default=dict)
    assessment_guidelines: Mapped[dict] = mapped_column(JSON, default=dict)
    test_assignment: Mapped[dict] = mapped_column(JSON, default=dict)
    assessment_center: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

