# Dev (без Docker)
python -m venv .venv
. .venv/Scripts/activate        # Windows
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload

# Dev (с Docker)
copy .env.example .env
docker compose up --build
docker compose exec api python -m app.seed # Запуск файла seed

# Alembic (после настройки DB_URL на Supabase)
alembic init app/migrations
alembic revision --autogenerate -m "init"
alembic upgrade head
