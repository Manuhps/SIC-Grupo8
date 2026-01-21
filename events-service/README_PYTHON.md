# events-service (Python)

This replaces the Node/Express `events-service` with a Python FastAPI implementation **without changing**:
- Docker Compose service name (`events-service`)
- exposed port (`3003`)
- base routes (`/events`)

## Endpoints

- `GET /events?page=1&limit=10&tipo=&status=`
- `GET /events/{id}`
- `POST /events` (requires Bearer JWT, user `tipo` = `organizador` or `admin`)
- `PATCH /events/{id}` (same auth)
- `DELETE /events/{id}` (same auth)

## Notes

- DB: MySQL (`events-db`) database `events_db`.
- Tables are created on startup if missing.
- JWT secret is read from `JWT_SECRET` (same env var as before).

## Run tests via Docker

From the repo root:

```zsh
docker compose -f docker-compose.yml -f docker-compose.test.yml run --rm events-service-test
```
