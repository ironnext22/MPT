FROM python:3.12-slim

WORKDIR /tests

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        libnss3 libx11-xcb1 libxcomposite1 libxcursor1 \
        libxdamage1 libxi6 libxtst6 libatk1.0-0 libatk-bridge2.0-0 \
        libcups2 libdrm2 libdbus-1-3 libxrandr2 libasound2 \
        libpangocairo-1.0-0 libpango-1.0-0 libgtk-3-0 libgbm1 \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir pytest pytest-playwright playwright

RUN playwright install --with-deps chromium

COPY Frontend/tests /tests
