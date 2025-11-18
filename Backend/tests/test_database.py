import os
import sys
import time
import asyncio
from datetime import datetime
from pathlib import Path

import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import select

from src.models import User

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql+asyncpg://mpt_user:mpt_pass@db:5432/mpt_db"
)

@pytest.fixture(scope="session")
async def db_engine():
    engine = create_async_engine(DATABASE_URL, future=True)
    yield engine
    await engine.dispose()


@pytest.fixture(scope="function")
async def session(db_engine):
    SessionLocal = sessionmaker(
        bind=db_engine, class_=AsyncSession, expire_on_commit=False
    )
    async with db_engine.begin() as connection:
        async with SessionLocal(bind=connection) as session:
            await session.begin_nested()
            yield session
            await session.rollback()


@pytest.mark.asyncio
async def test_postgres_engine_connection(db_engine):
    async with db_engine.connect() as conn:
        result = await conn.execute(text("SELECT 1 AS ok"))
        row = result.mappings().one()
        assert int(row["ok"]) == 1
