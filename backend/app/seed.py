# app/seed.py
import uuid
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from app.core.db import SessionLocal
from app.models.employee import Employee

MOCKS = [
    {
        "name": "Ирина Петрова",
        "email": "irina.petrova@example.com",
        "title": "HR-аналитик",
        "department": "FMCG",
        "unit": "Analytics",
        "region": "RU-Center",
        "manager_id": None,
        "photo_url": None,
        "bio": "Фокус: 360, компетенции, отчётность",
        "languages": {"ru": "C2", "en": "B1"},
        "contacts": {"telegram": "@irina_hr"},
        "current_role_started_at": date(2024, 11, 1),
        "competencies": {"Аналитика данных": 4, "Коммуникация": 3},
        "assessments_count": 2,
    },
    {
        "name": "Кирилл Соколов",
        "email": "kirill.sokolov@example.com",
        "title": "Координатор проектов",
        "department": "Electronics",
        "unit": "Coordination",
        "region": "RU-NW",
        "manager_id": None,
        "photo_url": None,
        "bio": "Процессы: SLA, нагрузка, вакансии",
        "languages": {"ru": "C2"},
        "contacts": {"phone": "+7-900-000-00-01"},
        "current_role_started_at": date(2025, 2, 5),
        "competencies": {"Оргнавыки": 4, "Внимание к деталям": 4},
        "assessments_count": 3,
    },
    {
        "name": "Мария Лебедева",
        "email": "maria.lebedeva@example.com",
        "title": "GKAM ассистент",
        "department": "FMCG",
        "unit": "KeyAccounts",
        "region": "RU-Volga",
        "manager_id": None,
        "photo_url": None,
        "bio": "Поддержка GKAM, отчёты, проверка фото",
        "languages": {"ru": "C2", "en": "A2"},
        "contacts": {"telegram": "@maria_ops"},
        "current_role_started_at": date(2025, 4, 10),
        "competencies": {"Excel": 4, "Коммуникация": 3},
        "assessments_count": 1,
    },
]

def seed_employees(db: Session):
    for m in MOCKS:
        stmt = insert(Employee).values(
            id=uuid.uuid4(),
            name=m["name"],
            email=m["email"],
            title=m["title"],
            department=m["department"],
            unit=m["unit"],
            region=m["region"],
            manager_id=m["manager_id"],
            photo_url=m["photo_url"],
            bio=m["bio"],
            languages=m["languages"],
            contacts=m["contacts"],
            current_role_started_at=m["current_role_started_at"],
            competencies=m["competencies"],
            assessments_count=m["assessments_count"],
        ).on_conflict_do_update(
            index_elements=[Employee.email],
            set_={
                "name": m["name"],
                "title": m["title"],
                "department": m["department"],
                "unit": m["unit"],
                "region": m["region"],
                "manager_id": m["manager_id"],
                "photo_url": m["photo_url"],
                "bio": m["bio"],
                "languages": m["languages"],
                "contacts": m["contacts"],
                "current_role_started_at": m["current_role_started_at"],
                "competencies": m["competencies"],
                "assessments_count": m["assessments_count"],
            },
        )
        db.execute(stmt)
    db.commit()

def main():
    db = SessionLocal()
    try:
        seed_employees(db)
        total = db.query(Employee).count()
        print(f"Employees seeded. Total now: {total}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
