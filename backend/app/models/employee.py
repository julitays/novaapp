# app/models/employee.py
import uuid
from datetime import date

from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, ForeignKey, JSON, Date, Integer
from sqlalchemy.dialects.postgresql import UUID as PGUUID  # ← явный тип UUID под Postgres

from app.core.db import Base


class Employee(Base):
    __tablename__ = "employees"

    # Явные UUID-типы + as_uuid=True для работы с python uuid.UUID
    id: Mapped[uuid.UUID] = mapped_column(
        PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    name: Mapped[str] = mapped_column(String(255), index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)

    title: Mapped[str] = mapped_column(String(255), default="")
    department: Mapped[str] = mapped_column(String(255), index=True, default="")
    unit: Mapped[str] = mapped_column(String(255), index=True, default="")
    region: Mapped[str] = mapped_column(String(255), index=True, default="")

    manager_id: Mapped[uuid.UUID | None] = mapped_column(
        PGUUID(as_uuid=True), ForeignKey("employees.id"), nullable=True, index=True
    )

    # единое поле для аватара/фото профиля
    avatar_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)

    bio: Mapped[str] = mapped_column(String(2000), default="")
    languages: Mapped[dict] = mapped_column(JSON, default=dict)
    contacts: Mapped[dict] = mapped_column(JSON, default=dict)

    # используем SQLAlchemy Date (а в аннотации — datetime.date)
    current_role_started_at: Mapped[date | None] = mapped_column(Date, nullable=True)

    competencies: Mapped[dict] = mapped_column(JSON, default=dict)
    assessments_count: Mapped[int] = mapped_column(Integer, default=0)
