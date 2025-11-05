FROM python:3.12-slim AS builder

WORKDIR /app

COPY Backend/Pipfile .
COPY Backend/Pipfile.lock .

RUN pip install --no-cache-dir pipenv && \
    pipenv install

EXPOSE 8000
