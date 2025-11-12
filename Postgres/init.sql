DROP SCHEMA IF EXISTS forms CASCADE;
CREATE SCHEMA IF NOT EXISTS forms;

CREATE TYPE forms.ans_type as ENUM (
     'short_text',
     'long_text',
     'single_choice',
     'multiple_choice'
    );

CREATE TABLE forms.users (
    ID bigserial PRIMARY KEY,
    username citext NOT NULL UNIQUE CHECK ( length(username) BETWEEN 3 and 50),
    password text NOT NULL,
    email citext NOT NULL UNIQUE,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE forms.forms (
    ID bigserial PRIMARY KEY,
    creator_id bigint NOT NULL,
    title        text NOT NULL,
    created_at   timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT forms_creator_fk FOREIGN KEY(creator_id) REFERENCES forms.users(ID)
);

CREATE TABLE forms.questions (
    id bigserial PRIMARY KEY,
    form_id bigint NOT NULL REFERENCES forms.forms(id) ON DELETE CASCADE,
    question_text text NOT NULL,
    ans_kind forms.ans_type NOT NULL,
    is_required  boolean NOT NULL DEFAULT false,
    position integer NOT NULL DEFAULT 1,
    created_at   timestamptz NOT NULL DEFAULT now(),
    UNIQUE (form_id, position)
);

CREATE INDEX questions_form_idx ON forms.questions(form_id);

CREATE TABLE forms.options (
    id           bigserial PRIMARY KEY,
    question_id  bigint NOT NULL
                 REFERENCES forms.questions(id) ON DELETE CASCADE,
    option_text  text   NOT NULL,
    is_correct   boolean NOT NULL DEFAULT false,
    position     integer NOT NULL DEFAULT 1,
    created_at   timestamptz NOT NULL DEFAULT now(),
    UNIQUE (question_id, position)
);

CREATE INDEX options_question_idx ON forms.options(question_id);

CREATE TABLE forms.respondents (
    id            bigserial PRIMARY KEY,
    email         citext,
    name          text,
    locale        text,
    gdpr_consent  boolean NOT NULL DEFAULT false,
    meta          jsonb NOT NULL DEFAULT '{}',
    created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX respondents_email_idx ON forms.respondents(email);

CREATE TABLE forms.submissions (
    id                 bigserial PRIMARY KEY,
    form_id            bigint NOT NULL
                        REFERENCES forms.forms(id) ON DELETE CASCADE,
    respondent_id      bigint
                        REFERENCES forms.respondents(id) ON DELETE SET NULL,
    respondent_user_id bigint
                        REFERENCES forms.users(id) ON DELETE SET NULL, -- opcjonalnie
    access_token       uuid NOT NULL DEFAULT gen_random_uuid(),
    started_at         timestamptz NOT NULL DEFAULT now(),
    submitted_at       timestamptz
);
CREATE INDEX submissions_form_idx            ON forms.submissions(form_id);
CREATE INDEX submissions_respondent_idx      ON forms.submissions(respondent_id);
CREATE INDEX submissions_respondent_user_idx ON forms.submissions(respondent_user_id);
CREATE INDEX submissions_token_idx           ON forms.submissions(access_token);

CREATE TABLE forms.answers (
    id             bigserial PRIMARY KEY,
    submission_id  bigint NOT NULL
                   REFERENCES forms.submissions(id) ON DELETE CASCADE,
    question_id    bigint NOT NULL
                   REFERENCES forms.questions(id) ON DELETE CASCADE,
    option_id      bigint
                   REFERENCES forms.options(id) ON DELETE CASCADE,
    answer_text    text,
    created_at     timestamptz NOT NULL DEFAULT now(),
    CHECK (answer_text IS NOT NULL OR option_id IS NOT NULL),
    UNIQUE (submission_id, question_id, option_id)
);