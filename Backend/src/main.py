import asyncio
import time
from datetime import datetime
from typing import AsyncGenerator

import redis.asyncio as redis
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.ext.asyncio import (AsyncEngine, AsyncSession,
                                    create_async_engine)
from sqlalchemy.orm import sessionmaker
from sqlmodel import select

from .models import User

DATABASE_URL = "postgresql+asyncpg://mpt_user:mpt_pass@db:5432/postgres"
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=False,
)

redis_client = None
pg_pool: AsyncEngine | None = None
SessionLocal: sessionmaker | None = None


async def wait_for_postgres(timeout: int = 30):
    start = time.time()
    while True:
        try:
            engine: AsyncEngine = create_async_engine(
                DATABASE_URL,
                echo=True,
                future=True,
            )
            print("Connected to PostgreSQL")
            return engine
        except Exception as e:
            if time.time() - start > timeout:
                raise TimeoutError(
                    "Could not connect to PostgreSQL within timeout"
                ) from e
            print(f"Waiting for PostgreSQL... ({e})")
            await asyncio.sleep(2)


async def wait_for_redis(timeout: int = 30):
    start = time.time()
    while True:
        try:
            client = redis.from_url("redis://redis", decode_responses=True)
            await client.ping()
            print("Connected to Redis")
            return client
        except Exception as e:
            if time.time() - start > timeout:
                raise TimeoutError("Could not connect to Redis within timeout") from e
            print(f"Waiting for Redis... ({e})")
            await asyncio.sleep(2)


@app.on_event("startup")
async def startup_event():
    global pg_pool, redis_client, SessionLocal
    pg_pool, redis_client = await asyncio.gather(wait_for_postgres(), wait_for_redis())
    SessionLocal = sessionmaker(
        bind=pg_pool, class_=AsyncSession, expire_on_commit=False
    )
    print("All services connected successfully.")


@app.get("/")
async def read_root():
    return {"message": "Hello World"}


@app.get("/check")
async def check_connections():
    async with pg_pool.connect() as conn:
        result = await conn.execute(text("SELECT 1 AS ok"))
        row = result.mappings().one()
        pg_ok = bool(row["ok"])

    await redis_client.set("ping", "pong")
    pong = await redis_client.get("ping")

    return {"postgres": pg_ok, "redis": pong}


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    assert SessionLocal is not None, "SessionLocal is not initialized"
    async with SessionLocal() as session:
        yield session


@app.get("/test/users", response_model=list[User])
async def test_get_users(session: AsyncSession = Depends(get_session)):
    ts = int(time.time())

    test_user = User(
        username=f"test_user_{ts}",
        password="test_password",
        email=f"test_{ts}@example.com",
        created_at=datetime.utcnow(),
    )

    session.add(test_user)
    await session.commit()
    await session.refresh(test_user)
    print(f"✅ Created test user with id={test_user.id}")

    result = await session.execute(select(User))
    users = result.scalars().all()

    await session.delete(test_user)
    await session.commit()
    print(f"🗑️ Deleted test user with id={test_user.id}")

    return users
