# alembic/env.py
import os
import sys
from logging.config import fileConfig
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import engine_from_config, pool, text # Added text
from alembic import context

from app.db.base_class import Base
from app.core.config import settings as app_settings # <--- YOUR APP SETTINGS

# This is the Alembic Config object...
config = context.config

# Interpret the config file for Python logging...
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def include_name(name, type_, parent_names):
    if type_ == "schema":
        return name in ["auth", "belching", "emission"]
    return True

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    # Use the synchronous URL for offline mode if defined, otherwise construct it
    db_url = app_settings.DATABASE_URL.replace("+asyncpg", "") # Convert async to sync
    context.configure(
        url=db_url,  # <--- USE APP SETTINGS URL (made sync)
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_schemas=True,
        include_name=include_name,
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    # Get the SQLAlchemy URL from your application's settings
    # Ensure it's the synchronous version for Alembic's direct engine creation
    db_url = app_settings.DATABASE_URL.replace("+asyncpg", "") # Convert async to sync

    # Create a new configuration dictionary for engine_from_config
    # that uses the URL from your app's settings.
    connectable_config = config.get_section(config.config_ini_section).copy()
    connectable_config["sqlalchemy.url"] = db_url # <--- OVERRIDE with app settings URL

    connectable = engine_from_config(
        connectable_config, # <--- USE THE MODIFIED CONFIG
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            include_schemas=True,
            include_name=include_name,
            compare_type=True,
        )
        # Create schemas if they don't exist
        for schema_name in ["auth", "belching", "emission"]:
            connection.execute(text(f"CREATE SCHEMA IF NOT EXISTS {schema_name}"))
        connection.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;'))
        connection.commit() # Commit schema and extension creation

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()