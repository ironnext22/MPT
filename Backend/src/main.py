import asyncio
import time
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from typing import AsyncGenerator, Optional, List

import redis.asyncio as redis
from fastapi import Depends, FastAPI, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from sqlalchemy import text
from sqlalchemy.orm import sessionmaker, selectinload
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine

from sqlmodel import SQLModel, select
from sqlmodel.ext.asyncio.session import AsyncSession

from passlib.context import CryptContext
from jose import jwt, JWTError

from .models import (
    User, Form, Question, Option,
    Answer, Submission, Respondent
)

from .schemas import (
    UserCreate, UserRead, Token,
    FormCreate, FormRead,
    SubmissionCreate, SubmissionRead,
    RespondentCreate, RespondentRead
)

from .forms_links import (create_forms_token, decode_forms_token, generate_qr_code)


load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

DATABASE_URL = (
    f"postgresql+asyncpg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

SECRET_KEY = "ZMIEN_TO_NA_SEKRETNY_KLUCZ"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

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
            engine = create_async_engine(DATABASE_URL, echo=True, future=True)
            return engine
        except Exception as e:
            if time.time() - start > timeout:
                raise TimeoutError("Could not connect to PostgreSQL") from e
            await asyncio.sleep(2)


async def wait_for_redis(timeout: int = 30):
    start = time.time()
    while True:
        try:
            client = redis.from_url("redis://redis", decode_responses=True)
            await client.ping()
            return client
        except Exception as e:
            if time.time() - start > timeout:
                raise TimeoutError("Could not connect to Redis") from e
            await asyncio.sleep(2)


@app.on_event("startup")
async def startup_event():
    global pg_pool, redis_client, SessionLocal

    pg_pool, redis_client = await asyncio.gather(
        wait_for_postgres(),
        wait_for_redis()
    )

    SessionLocal = sessionmaker(
        bind=pg_pool,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async with pg_pool.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        yield session


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str):
    return pwd_context.verify(password, hashed)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    ))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: AsyncSession = Depends(get_session),
) -> User:

    cred_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise cred_exc
    except JWTError:
        raise cred_exc

    result = await session.exec(select(User).where(User.username == username))
    user = result.first()
    if not user:
        raise cred_exc

    return user


@app.get("/")
async def read_root():
    return {"message": "Hello World"}


@app.get("/check")
async def check_connections():
    async with pg_pool.connect() as conn:
        result = await conn.execute(text("SELECT 1 AS ok"))
        row = result.mappings().one()
        ok = bool(row["ok"])

    await redis_client.set("ping", "pong")
    pong = await redis_client.get("ping")

    return {"postgres": ok, "redis": pong}


@app.post("/users", response_model=UserRead)
async def register_user(
    user_in: UserCreate,
    session: AsyncSession = Depends(get_session),
):
    result = await session.exec(select(User).where(User.username == user_in.username))
    existing = result.first()
    if existing:
        raise HTTPException(400, "Username already exists")

    user = User(
        username=user_in.username,
        password=hash_password(user_in.password),
        email=user_in.email,
        created_at=datetime.utcnow(),
    )

    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


@app.post("/token", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: AsyncSession = Depends(get_session),
):
    result = await session.exec(select(User).where(User.username == form_data.username))
    user = result.first()

    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(401, "Incorrect username or password")

    token = create_access_token({"sub": user.username})
    return Token(access_token=token)


@app.get("/me", response_model=UserRead)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@app.post("/forms", response_model=FormRead)
async def create_form(
    form_in: FormCreate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    form = Form(
        creator_id=user.id,
        title=form_in.title,
        created_at=datetime.utcnow(),
    )
    session.add(form)
    await session.flush()

    for q in form_in.questions:
        question = Question(
            form_id=form.id,
            question_text=q.question_text,
            ans_kind=q.ans_kind,
            is_required=q.is_required,
            position=q.position,
            created_at=datetime.utcnow(),
        )
        session.add(question)
        await session.flush()

        for o in q.options:
            option = Option(
                question_id=question.id,
                option_text=o.option_text,
                is_correct=o.is_correct,
                position=o.position,
                created_at=datetime.utcnow(),
            )
            session.add(option)

    await session.commit()
    await session.refresh(form)
    #
    # for q in form.questions:
    #     _ = q.options
    result = await session.exec(
        select(Form)
        .where(Form.id == form.id)
        .options(
            selectinload(Form.questions).selectinload(Question.options)
        )
    )
    form_db = result.one()

    return FormRead.model_validate(form_db)


@app.get("/forms", response_model=List[FormRead])
async def list_forms(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.exec(select(Form).where(Form.creator_id == user.id))
    forms = result.all()

    # for f in forms:
    #     for q in f.questions:
    #         _ = q.options

    stmt = (
        select(Form)
        .where(Form.creator_id == user.id)
        .options(
            selectinload(Form.questions).selectinload(Question.options)
        )
    )
    result = await session.exec(stmt)
    forms = result.unique().all()

    return [FormRead.model_validate(f) for f in forms]


@app.get("/forms/{form_id}", response_model=FormRead)
async def get_form(
    form_id: int,
    session: AsyncSession = Depends(get_session),
):
    form = await session.get(Form, form_id)
    if not form:
        raise HTTPException(404, "Form not found")

    result = await session.exec(
        select(Form)
        .where(Form.id == form.id)
        .options(
            selectinload(Form.questions).selectinload(Question.options)
        )
    )
    form_db = result.one()

    return FormRead.model_validate(form_db)


@app.post("/respondents", response_model=RespondentRead)
async def create_respondent(
    r_in: RespondentCreate,
    session: AsyncSession = Depends(get_session),
):
    r = Respondent(
        email=r_in.email,
        name=r_in.name,
        locale=r_in.locale,
        gdpr_consent=r_in.gdpr_consent,
        created_at=datetime.utcnow(),
    )
    session.add(r)
    await session.commit()
    await session.refresh(r)
    return r


@app.post("/submissions", response_model=SubmissionRead)
async def create_submission(
    sub_in: SubmissionCreate,
    session: AsyncSession = Depends(get_session),
):
    form = await session.get(Form, sub_in.form_id)
    if not form:
        raise HTTPException(404, "Form not found")

    submission = Submission(
        form_id=form.id,
        respondent_id=sub_in.respondent_id,
        respondent_user_id=sub_in.respondent_user_id,
        started_at=datetime.utcnow(),
        submitted_at=datetime.utcnow(),
    )
    session.add(submission)
    await session.flush()

    for a in sub_in.answers:
        if (a.answer_text is None or a.answer_text == "") and a.option_id is None:
            continue
        answer = Answer(
            submission_id=submission.id,
            question_id=a.question_id,
            answer_text=a.answer_text,
            option_id=a.option_id,
            created_at=datetime.utcnow(),
        )
        session.add(answer)

    await session.commit()
    await session.refresh(submission)

    result = await session.exec(
        select(Submission)
        .where(Submission.id == submission.id)
        .options(selectinload(Submission.answers))
    )
    sub_db = result.one()

    return SubmissionRead.model_validate(sub_db)


@app.get("/forms/{form_id}/submissions", response_model=List[SubmissionRead])
async def get_submissions(
    form_id: int,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    form = await session.get(Form, form_id)
    if not form:
        raise HTTPException(404, "Form not found")

    if form.creator_id != user.id:
        raise HTTPException(403, "Not authorized")

    result = await session.exec(select(Submission).where(Submission.form_id == form_id))
    submissions = result.all()

    stmt = (
        select(Submission)
        .where(Submission.form_id == form_id)
        .options(selectinload(Submission.answers))
    )
    result = await session.exec(stmt)
    submissions = result.unique().all()

    return [SubmissionRead.model_validate(s) for s in submissions]

@app.post("/forms/{forms_id}/link")
async def create_forms_link(
    forms_id: int,
    request: Request,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    form = await session.get(Form, forms_id)
    if not form:
        raise HTTPException(404, "Form not found")

    if form.creator_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    creator = await session.get(User, form.creator_id)
    if not creator:
        raise HTTPException(status_code=400, detail="Creator not found")

    token = create_forms_token(form.id, creator.email)
    backend_link = request.url_for("get_form_by_token", token=token)

    origin = request.headers.get("origin")
    if origin:
        share_link = f"{origin}/forms/public/{token}"
    else:
        share_link = str(backend_link)

    qr_code = generate_qr_code(str(share_link))

    return {
        "form_id": form.id,
        "token": token,
        "share_link": str(share_link),
        "qr_code": qr_code,
    }

@app.get("/forms/public/{token}", response_model=FormRead, name="get_form_by_token")
async def get_form_by_token(
    token: str,
    session: AsyncSession = Depends(get_session),
):
    payload = decode_forms_token(token)
    form_id = payload["form_id"]
    creator_email = payload["creator_email"]

    form = await session.get(Form, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    creator = await session.get(User, form.creator_id)
    if not creator or creator.email != creator_email:
        raise HTTPException(status_code=400, detail="Token does not match form")

    result = await session.exec(
        select(Form)
        .where(Form.id == form.id)
        .options(
            selectinload(Form.questions).selectinload(Question.options)
        )
    )
    form_db = result.one()

    return FormRead.model_validate(form_db)