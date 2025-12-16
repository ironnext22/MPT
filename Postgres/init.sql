-- =========================
-- Extensions
-- =========================
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================
-- Schema
-- =========================
DROP SCHEMA IF EXISTS forms CASCADE;
CREATE SCHEMA forms;

-- =========================
-- Enums
-- =========================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE t.typname = 'ans_type'
          AND n.nspname = 'forms'
    ) THEN
        CREATE TYPE forms.ans_type AS ENUM (
            'short_text',
            'long_text',
            'single_choice',
            'multiple_choice'
        );
    END IF;
END $$;

-- =========================
-- Users
-- =========================
CREATE TABLE forms.users (
    id BIGSERIAL PRIMARY KEY,

    username CITEXT NOT NULL UNIQUE
        CHECK (length(username) BETWEEN 3 AND 50),

    password TEXT NOT NULL,
    email CITEXT NOT NULL UNIQUE,

    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    email_verification_token TEXT,
    email_verification_expires TIMESTAMPTZ,

    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================
-- Forms
-- =========================
CREATE TABLE forms.forms (
    id BIGSERIAL PRIMARY KEY,
    creator_id BIGINT NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT forms_creator_fk
        FOREIGN KEY (creator_id)
        REFERENCES forms.users(id)
        ON DELETE CASCADE
);

-- =========================
-- Questions
-- =========================
CREATE TABLE forms.questions (
    id BIGSERIAL PRIMARY KEY,
    form_id BIGINT NOT NULL
        REFERENCES forms.forms(id)
        ON DELETE CASCADE,

    question_text TEXT NOT NULL,
    ans_kind forms.ans_type NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    position INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (form_id, position)
);

CREATE INDEX questions_form_idx
    ON forms.questions(form_id);

-- =========================
-- Options
-- =========================
CREATE TABLE forms.options (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL
        REFERENCES forms.questions(id)
        ON DELETE CASCADE,

    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    position INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (question_id, position)
);

CREATE INDEX options_question_idx
    ON forms.options(question_id);

-- =========================
-- Respondents
-- =========================
CREATE TABLE forms.respondents (
    id BIGSERIAL PRIMARY KEY,
    email CITEXT,
    name TEXT,
    locale TEXT,
    gdpr_consent BOOLEAN NOT NULL DEFAULT FALSE,
    meta JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX respondents_email_idx
    ON forms.respondents(email);

-- =========================
-- Submissions
-- =========================
CREATE TABLE forms.submissions (
    id BIGSERIAL PRIMARY KEY,

    form_id BIGINT NOT NULL
        REFERENCES forms.forms(id)
        ON DELETE CASCADE,

    respondent_id BIGINT
        REFERENCES forms.respondents(id)
        ON DELETE SET NULL,

    respondent_user_id BIGINT
        REFERENCES forms.users(id)
        ON DELETE SET NULL,

    access_token UUID NOT NULL DEFAULT gen_random_uuid(),
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    submitted_at TIMESTAMPTZ
);

CREATE INDEX submissions_form_idx
    ON forms.submissions(form_id);

CREATE INDEX submissions_respondent_idx
    ON forms.submissions(respondent_id);

CREATE INDEX submissions_respondent_user_idx
    ON forms.submissions(respondent_user_id);

CREATE INDEX submissions_token_idx
    ON forms.submissions(access_token);

-- =========================
-- Answers
-- =========================
CREATE TABLE forms.answers (
    id BIGSERIAL PRIMARY KEY,

    submission_id BIGINT NOT NULL
        REFERENCES forms.submissions(id)
        ON DELETE CASCADE,

    question_id BIGINT NOT NULL
        REFERENCES forms.questions(id)
        ON DELETE CASCADE,

    option_id BIGINT
        REFERENCES forms.options(id)
        ON DELETE CASCADE,

    answer_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CHECK (answer_text IS NOT NULL OR option_id IS NOT NULL),
    UNIQUE (submission_id, question_id, option_id)
);
