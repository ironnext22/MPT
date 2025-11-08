from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncpg
import redis.asyncio as redis
import asyncio
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=False,
)

pg_pool = None
redis_client = None


async def wait_for_postgres(timeout: int = 30):
    start = time.time()
    while True:
        try:
            pool = await asyncpg.create_pool(
                user="mpt_user",
                password="mpt_pass",
                database="mpt_db",
                host="db",
            )
            print("Connected to PostgreSQL")
            return pool
        except Exception as e:
            if time.time() - start > timeout:
                raise TimeoutError("Could not connect to PostgreSQL within timeout") from e
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
    global pg_pool, redis_client
    pg_pool, redis_client = await asyncio.gather(
        wait_for_postgres(), wait_for_redis()
    )
    print("All services connected successfully.")


@app.get("/")
async def read_root():
    return {"message": "Hello World"}


@app.get("/check")
async def check_connections():
    async with pg_pool.acquire() as conn:
        row = await conn.fetchrow("SELECT 1 AS ok")

    await redis_client.set("ping", "pong")
    pong = await redis_client.get("ping")

    return {"postgres": row["ok"], "redis": pong}
