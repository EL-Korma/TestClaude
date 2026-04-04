# Postgres Setup (Docker)

## 1) Create env file

Copy the example and edit if needed:

```bash
cp .env.example .env
```

## 2) Start Postgres

```bash
docker compose up -d
```

## 3) Connection string

```text
postgresql://POSTGRES_USER:POSTGRES_PASSWORD@localhost:POSTGRES_PORT/POSTGRES_DB
```

Example (default values):

```text
postgresql://twinfit:dev_password_change_me@localhost:5432/twinfit
```
