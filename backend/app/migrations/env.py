from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context

# <-- добавляем наши импорты
from app.core.config import settings
from app.core.db import Base
# Важно: импортируем модели, чтобы автоген понимал схемы
from app.models.user import User
from app.models.employee import Employee

# Alembic Config object
config = context.config

# Логи из alembic.ini (можно оставить)
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Метаданные для автогенерации миграций
target_metadata = Base.metadata

def run_migrations_offline():
    """Запуск без соединения (генерация SQL)."""
    url = settings.DB_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    """Запуск с реальным соединением."""
    configuration = config.get_section(config.config_ini_section)
    # КРИТИЧЕСКОЕ МЕСТО: пробрасываем наш URL из .env
    configuration["sqlalchemy.url"] = settings.DB_URL

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
        future=True,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()
