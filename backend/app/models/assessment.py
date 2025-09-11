import uuid
from sqlalchemy.orm import Mapped, mapped_column
from datetime import date, datetime
from sqlalchemy import ForeignKey, Date, Numeric, String, JSON, DateTime
from sqlalchemy.sql import func
from app.core.db import Base

class Assessment(Base):
    __tablename__ = "assessments"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    employee_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("employees.id", ondelete="CASCADE"), index=True)
    role_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("roles.id", ondelete="SET NULL"), nullable=True, index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    percent: Mapped[float] = mapped_column(Numeric(5,2))
    source: Mapped[str] = mapped_column(String(64), default="manual")  # manual|test|assessment_center|import
    payload: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
