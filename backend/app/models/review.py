import uuid
from sqlalchemy.orm import Mapped, mapped_column
from datetime import date, datetime
from sqlalchemy import ForeignKey, String, Text, JSON, Date, DateTime
from sqlalchemy.sql import func
from app.core.db import Base

class Review(Base):
    __tablename__ = "reviews"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    employee_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("employees.id", ondelete="CASCADE"), index=True)
    type: Mapped[str] = mapped_column(String(32))  # client|manager
    date: Mapped[date] = mapped_column(Date, nullable=False)
    text: Mapped[str] = mapped_column(Text, default="")
    meta: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
