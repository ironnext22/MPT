# schemas.py
from datetime import datetime
from typing import List, Optional
from sqlmodel import SQLModel


class UserCreate(SQLModel):
    username: str
    password: str
    email: str


class UserRead(SQLModel):
    id: int
    username: str
    email: str
    created_at: datetime
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


class OptionCreate(SQLModel):
    option_text: str
    is_correct: Optional[bool] = False
    position: int


class QuestionCreate(SQLModel):
    question_text: str
    ans_kind: str
    is_required: bool = True
    position: int
    options: List[OptionCreate] = []


class FormCreate(SQLModel):
    title: str
    questions: List[QuestionCreate] = []


class OptionRead(SQLModel):
    id: int
    option_text: str
    is_correct: Optional[bool]
    position: int

    class Config:
        from_attributes = True


class QuestionRead(SQLModel):
    id: int
    question_text: str
    ans_kind: str
    is_required: bool
    position: int
    options: List[OptionRead] = []

    class Config:
        from_attributes = True


class FormRead(SQLModel):
    id: int
    title: str
    created_at: datetime
    creator_id: int
    questions: List[QuestionRead] = []

    class Config:
        from_attributes = True


class AnswerCreate(SQLModel):
    question_id: int
    answer_text: Optional[str] = None
    option_id: Optional[int] = None


class SubmissionCreate(SQLModel):
    form_id: int
    respondent_id: Optional[int] = None
    respondent_user_id: Optional[int] = None
    answers: List[AnswerCreate]


class AnswerRead(SQLModel):
    id: int
    question_id: int
    answer_text: Optional[str]
    option_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class SubmissionRead(SQLModel):
    id: int
    form_id: int
    respondent_id: Optional[int]
    respondent_user_id: Optional[int]
    started_at: datetime
    submitted_at: Optional[datetime]
    answers: List[AnswerRead] = []

    class Config:
        from_attributes = True


class RespondentCreate(SQLModel):
    email: str
    name: Optional[str] = None
    locale: Optional[str] = None
    gdpr_consent: bool = True


class RespondentRead(SQLModel):
    id: int
    email: str
    name: Optional[str]
    locale: Optional[str]
    gdpr_consent: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserAvatarUpdate(SQLModel):
    avatar_url: str


class UserUpdateUsername(SQLModel):
    username: str


class UserUpdateEmail(SQLModel):
    email: str


class UserUpdatePassword(SQLModel):
    current_password: str
    new_password: str