# app/models/employee.py
import uuid
from datetime import date
from typing import Optional, Dict

from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, ForeignKey, JSON, Integer
from sqlalchemy.dialects.postgresql import UUID  # важный импорт: тип UUID для Postgres

from app.core.db import Base

class Employee(Base):
    __tablename__ = "employees"

    # UUID PK — согласованный тип для Postgres
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    name: Mapped[str] = mapped_column(String(255), index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255), default="")
    department: Mapped[str] = mapped_column(String(255), index=True, default="")
    unit: Mapped[str] = mapped_column(String(255), index=True, default="")
    region: Mapped[str] = mapped_column(String(255), index=True, default="")

    # ВАЖНО: тип аннотации — Python (Optional[uuid.UUID]), а колонка — SQLAlchemy UUID
    manager_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employees.id"), nullable=True, index=True
    )

    photo_url: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    bio: Mapped[str] = mapped_column(String(2000), default="")

    # Для JSON в аннотациях — обычные Python-типы:
    # Dict[str, str] и т.п. (или просто dict, если не хочется строгости)
    languages: Mapped[Dict[str, str]] = mapped_column(JSON, default=dict)
    contacts: Mapped[Dict[str, str]] = mapped_column(JSON, default=dict)

    # ТУТ ГЛАВНАЯ ПРАВКА: используем datetime.date, не sqlalchemy.Date
    current_role_started_at: Mapped[Optional[date]] = mapped_column(nullable=True)

    competencies: Mapped[Dict[str, int]] = mapped_column(JSON, default=dict)
    assessments_count: Mapped[int] = mapped_column(Integer, default=0)
