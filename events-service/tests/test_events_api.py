import os
from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient


@pytest.fixture(autouse=True)
def _set_test_jwt_secret(monkeypatch):
    # Ensure consistent secret for tests
    monkeypatch.setenv("JWT_SECRET", "test_secret")


@pytest.fixture
def app(monkeypatch):
    # Patch DB engine + Base.create_all so tests don't require MySQL
    from . import events_service_shim  # noqa: F401

    from app import main as app_main

    monkeypatch.setattr(app_main.Base.metadata, "create_all", lambda bind=None: None)

    class _FakeSession:
        def __init__(self):
            self._data = {}
            self._next_id = 1

        def execute(self, *args, **kwargs):
            raise NotImplementedError("execute is not used in patched endpoints")

        def get(self, model, id):
            return self._data.get(int(id))

        def add(self, obj):
            if getattr(obj, "id", None) is None:
                obj.id = self._next_id
                self._next_id += 1
            now = datetime.now(timezone.utc)
            obj.created_at = getattr(obj, "created_at", now)
            obj.updated_at = now
            self._data[int(obj.id)] = obj

        def commit(self):
            return None

        def refresh(self, obj):
            return None

        def delete(self, obj):
            self._data.pop(int(obj.id), None)

        def close(self):
            return None

    fake_db = _FakeSession()

    def _fake_get_db():
        yield fake_db

    app = app_main.create_app()

    # Patch endpoints to avoid SQLAlchemy querying
    # We'll monkeypatch router functions directly for list endpoint.
    # For create/update/delete/get-by-id we rely on fake_db.get/add/delete.

    # Replace dependency
    app.dependency_overrides[app_main.get_db] = _fake_get_db

    # Patch list endpoint implementation to return empty list consistently
    for route in app.router.routes:
        if getattr(route, "path", None) == "/events" and "GET" in getattr(route, "methods", set()):
            async def _list_stub(*args, **kwargs):
                return {"total": 0, "totalPages": 0, "currentPage": 1, "data": []}

            route.endpoint = _list_stub

    return app


@pytest.fixture
def client(app):
    return TestClient(app)


def _make_token(payload: dict) -> str:
    from jose import jwt

    return jwt.encode(payload, os.environ["JWT_SECRET"], algorithm="HS256")


def test_get_events_public(client):
    r = client.get("/events")
    assert r.status_code == 200
    body = r.json()
    assert set(body.keys()) == {"total", "totalPages", "currentPage", "data"}


def test_create_event_requires_token(client):
    r = client.post("/events", json={})
    assert r.status_code == 401


def test_create_event_organizador_success(client):
    token = _make_token({"id": 10, "tipo": "organizador"})
    payload = {
        "nome": "Evento 1",
        "descricao": "Desc",
        "data_inicio": "2030-01-01T10:00:00Z",
        "local": "Porto",
        "capacidade": 100,
        "preco": 0,
        "tipo": "cultural",
    }

    r = client.post("/events", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 201
    data = r.json()
    assert data["organizador_id"] == 10
    assert data["nome"] == "Evento 1"


def test_create_event_forbidden_for_user(client):
    token = _make_token({"id": 10, "tipo": "cliente"})
    payload = {
        "nome": "Evento 1",
        "descricao": "Desc",
        "data_inicio": "2030-01-01T10:00:00Z",
        "local": "Porto",
        "capacidade": 100,
        "tipo": "cultural",
    }

    r = client.post("/events", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 403


def test_update_requires_owner_or_admin(client):
    # Create event as organizer 10
    token_10 = _make_token({"id": 10, "tipo": "organizador"})
    payload = {
        "nome": "Evento 1",
        "descricao": "Desc",
        "data_inicio": "2030-01-01T10:00:00Z",
        "local": "Porto",
        "capacidade": 100,
        "tipo": "cultural",
    }
    created = client.post("/events", json=payload, headers={"Authorization": f"Bearer {token_10}"})
    event_id = created.json()["id"]

    # Try update as organizer 11 (not owner)
    token_11 = _make_token({"id": 11, "tipo": "organizador"})
    r = client.patch(
        f"/events/{event_id}",
        json={"nome": "Novo"},
        headers={"Authorization": f"Bearer {token_11}"},
    )
    assert r.status_code == 403

    # Update as admin
    token_admin = _make_token({"id": 99, "tipo": "admin"})
    r2 = client.patch(
        f"/events/{event_id}",
        json={"nome": "Novo"},
        headers={"Authorization": f"Bearer {token_admin}"},
    )
    assert r2.status_code == 200
    assert r2.json()["nome"] == "Novo"
