import uuid
from uuid import uuid4
import random
from datetime import date

from sqlalchemy.orm import Session
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert

from app.core.security import require_roles
from app.core.security import hash_password
from app.core.config import settings
from app.core.db import SessionLocal

from app.models.user import User
from app.models.employee import Employee
from app.models.role import Role, RoleStatus
from app.models.assessment import Assessment
from app.models.vacancy import Vacancy, VacancyStatus

# --- MOCK DATA ---

MOCK_EMPLOYEES = [
    {
        "name": "Ирина Петрова",
        "email": "irina.petrova@example.com",
        "title": "HR-аналитик",
        "department": "FMCG",
        "unit": "Analytics",
        "region": "RU-Center",
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
        "bio": "Поддержка GKAM, отчёты, проверка фото",
        "languages": {"ru": "C2", "en": "A2"},
        "contacts": {"telegram": "@maria_ops"},
        "current_role_started_at": date(2025, 4, 10),
        "competencies": {"Excel": 4, "Коммуникация": 3},
        "assessments_count": 1,
    },
]

MOCK_ROLES = [
    dict(
        name="GKAM",
        version=1,
        division="FMCG",
        status=RoleStatus.active,
        goal="Рост выручки ключевых клиентов",
        responsibilities={"core": ["Переговоры", "План продаж"]},
        kpi={"RevenueGrowth": ">=10%", "Retention": ">=95%"},
        competency_map={"Negotiation": 4, "Analytics": 3},
    ),
    dict(
        name="Координатор проектов",
        version=1,
        division="Electronics",
        status=RoleStatus.active,
        goal="Соблюдение SLA, управление нагрузкой",
        responsibilities={"core": ["План-график", "Контроль фотоотчётов"]},
        kpi={"SLA": ">=95%", "Backlog": "<=3%"},
        competency_map={"Оргнавыки": 4, "Внимание к деталям": 4},
    ),
]

# --- SEED FUNCTIONS ---

def seed_employees(db: Session):
    for m in MOCK_EMPLOYEES:
        stmt = insert(Employee).values(
            id=uuid.uuid4(),
            name=m["name"],
            email=m["email"],
            title=m["title"],
            department=m["department"],
            unit=m["unit"],
            region=m["region"],
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


def seed_roles(db: Session):
    for r in MOCK_ROLES:
        exists = db.scalar(
            select(Role).where(Role.name == r["name"], Role.version == r["version"])
        )
        if not exists:
            db.add(Role(**r))
    db.commit()


def seed_assessments(db: Session):
    emps = db.execute(select(Employee).limit(3)).scalars().all()
    roles = db.execute(select(Role)).scalars().all()
    role_map = {r.name: r for r in roles}
    for e in emps:
        for d in [date(2025, 5, 1), date(2025, 8, 1), date(2025, 9, 1)]:
            db.add(
                Assessment(
                    employee_id=e.id,
                    role_id=role_map.get("Координатор проектов", None).id
                    if "Координатор" in e.title
                    else None,
                    date=d,
                    percent=round(random.uniform(62, 91), 2),
                    source="manual",
                    payload={"details": {"Communication": random.randint(3, 5)}},
                )
            )
    db.commit()

def seed_vacancies(db):
    # возьмем любую роль для связи
    from app.models.role import Role
    role = db.scalar(select(Role))
    if not role:
        return
    # создадим один пример
    exists = db.scalar(select(Vacancy).where(Vacancy.role_id == role.id))
    if not exists:
        db.add(Vacancy(
            id=uuid4(),
            role_id=role.id,
            department="FMCG",
            unit="Coordination",
            status=VacancyStatus.open,
            headcount=2,
            location="Москва",
            notes="Нужно закрыть до конца месяца",
        ))
        db.commit()

def seed_users(db):
    # гарантируем ADMIN из .env
    admin = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
    if not admin:
        db.add(User(email=settings.ADMIN_EMAIL, password_hash=hash_password(settings.ADMIN_PASSWORD), role="admin"))

    # ещё парочка для тестов
    samples = [
        ("hr@example.com", "hr", "Hr123!test"),
        ("manager@example.com", "manager", "Manager123!"),
        ("viewer@example.com", "viewer", "Viewer123!"),
        ("supervisor@example.com", "supervisor", "Supervisor123!"),
        ("employee@example.com", "employee", "Employee123!"),
    ]
    for email, role, pwd in samples:
        if not db.query(User).filter(User.email == email).first():
            db.add(User(email=email, password_hash=hash_password(pwd), role=role))
    db.commit()

# --- ENTRYPOINT ---

def main():
    db = SessionLocal()
    try:
        seed_employees(db)
        seed_roles(db)
        seed_assessments(db)
        seed_vacancies(db)
        seed_users(db)
        total_e = db.query(Employee).count()
        total_r = db.query(Role).count()
        total_a = db.query(Assessment).count()
        total_v = db.query(Vacancy).count()
        print(f"Seed OK. Employees={total_e}, Roles={total_r}, Assessments={total_a}, Vacancies={total_v}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
