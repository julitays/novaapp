import uuid
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from sqlalchemy import ForeignKey, String, Text, Integer, Enum, DateTime
from sqlalchemy.sql import func
from app.core.db import Base
import enum

class VacancyStatus(str, enum.Enum):
    open = "open"
    hold = "hold"
    closed = "closed"

class Vacancy(Base):
    __tablename__ = "vacancies"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    role_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("roles.id", ondelete="CASCADE"), index=True)
    department: Mapped[str] = mapped_column(String(255), index=True, default="")
    unit: Mapped[str] = mapped_column(String(255), index=True, default="")
    manager_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("employees.id", ondelete="SET NULL"), nullable=True, index=True)
    status: Mapped[VacancyStatus] = mapped_column(Enum(VacancyStatus), default=VacancyStatus.open, index=True)
    headcount: Mapped[int] = mapped_column(Integer, default=1)
    location: Mapped[str] = mapped_column(String(255), default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
