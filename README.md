# Aplikacja do tworzenia i udostępniania ankiet, głosowań

## 🌐 Architektura aplikacji
**Frontend:** React (JS)\
**Backend:** FastAPI (Python)\
**Baza danych:** PostgreSQL + Redis

---
```mermaid
graph TB
  %% Każdy subgraph = 1 kontener
  subgraph app
    subgraph react["Frontend"]
      R[React SPA]
    end

    subgraph backend["Backend"]
      B[FastAPI Backend]
      W[Worker]
    end

    subgraph postgres["Database"]
      PG[(PostgreSQL)]
      RD[(Redis)]
    end
  end

  R --> B
  B --> PG
  B --> RD
  W --> PG
```

## Run project with docker compose

```
$ docker compose up
```

## Prepare ubuntu for playwright tests

```
$ sudo apt install x11-xserver-utils
$ xhost +local:docker
```

## Run frontend tests with playwright

```
$ docker compose run frontend_tests