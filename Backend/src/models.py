import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Column, Enum as PgEnum, UUID
from sqlmodel import Field, Relationship, SQLModel


from sqlalchemy import Column, DateTime
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional


from typing import Optional, List
from datetime import datetime
from sqlalchemy import Column, DateTime
from sqlmodel import SQLModel, Field, Relationship


class User(SQLModel, table=True):
    __tablename__ = "users"
    __table_args__ = {"schema": "forms"}

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str
    password: str
    email: str

    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )

    avatar_url: Optional[str] = None

    is_email_verified: bool = Field(default=False)
    email_verification_token: Optional[str] = None
    email_verification_expires: Optional[datetime] = Field(
        default=None, sa_column=Column(DateTime(timezone=True))
    )

    forms: List["Form"] = Relationship(back_populates="creator")
    submissions: List["Submission"] = Relationship(back_populates="respondent_user")


class Respondent(SQLModel, table=True):
    __tablename__ = "respondents"
    __table_args__ = {"schema": "forms"}

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str
    name: Optional[str] = None
    locale: Optional[str] = None
    gdpr_consent: bool
    created_at: datetime

    submissions: list["Submission"] = Relationship(back_populates="respondent")


class Form(SQLModel, table=True):
    __tablename__ = "forms"
    __table_args__ = {"schema": "forms"}

    id: Optional[int] = Field(default=None, primary_key=True)
    creator_id: int = Field(foreign_key="forms.users.id")
    title: str
    created_at: datetime

    creator: User = Relationship(back_populates="forms")
    questions: list["Question"] = Relationship(back_populates="form")
    submissions: list["Submission"] = Relationship(back_populates="form")


class Submission(SQLModel, table=True):
    __tablename__ = "submissions"
    __table_args__ = {"schema": "forms"}

    id: Optional[int] = Field(default=None, primary_key=True)

    form_id: int = Field(foreign_key="forms.forms.id")
    respondent_id: Optional[int] = Field(
        default=None, foreign_key="forms.respondents.id"
    )
    respondent_user_id: Optional[int] = Field(
        default=None, foreign_key="forms.users.id"
    )

    access_token: Optional[uuid.UUID] = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(UUID(as_uuid=True), nullable=True),
    )
    started_at: datetime
    submitted_at: Optional[datetime] = None

    form: Form = Relationship(back_populates="submissions")
    respondent: Optional[Respondent] = Relationship(back_populates="submissions")
    respondent_user: Optional[User] = Relationship(back_populates="submissions")
    answers: list["Answer"] = Relationship(back_populates="submission")


class Question(SQLModel, table=True):
    __tablename__ = "questions"
    __table_args__ = {"schema": "forms"}

    id: Optional[int] = Field(default=None, primary_key=True)

    form_id: int = Field(foreign_key="forms.forms.id")
    question_text: str
    ans_kind: str = Field(
        sa_column=Column(
            PgEnum(
                "short_text",
                "long_text",
                "single_choice",
                "multiple_choice",
                name="ans_type",
                schema="forms",
            ),
            nullable=False,
        )
    )
    is_required: bool
    position: int
    created_at: datetime

    form: Form = Relationship(back_populates="questions")
    options: list["Option"] = Relationship(back_populates="question")
    answers: list["Answer"] = Relationship(back_populates="question")


class Option(SQLModel, table=True):
    __tablename__ = "options"
    __table_args__ = {"schema": "forms"}

    id: Optional[int] = Field(default=None, primary_key=True)

    question_id: int = Field(foreign_key="forms.questions.id")
    option_text: str
    is_correct: Optional[bool] = False
    position: int
    created_at: datetime

    question: Question = Relationship(back_populates="options")
    answers: list["Answer"] = Relationship(back_populates="selected_option")


class Answer(SQLModel, table=True):
    __tablename__ = "answers"
    __table_args__ = {"schema": "forms"}

    id: Optional[int] = Field(default=None, primary_key=True)

    submission_id: int = Field(foreign_key="forms.submissions.id")
    question_id: int = Field(foreign_key="forms.questions.id")
    answer_text: Optional[str] = None
    option_id: Optional[int] = Field(default=None, foreign_key="forms.options.id")
    created_at: datetime

    submission: Submission = Relationship(back_populates="answers")
    question: Question = Relationship(back_populates="answers")
    selected_option: Optional[Option] = Relationship(back_populates="answers")
