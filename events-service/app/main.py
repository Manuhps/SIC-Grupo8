from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import asc, func, select
from sqlalchemy.orm import Session

from .auth import require_organizador, verify_token
from .db import Base, engine, get_db
from .models import Evento
from .schemas import EventoCreate, EventoOut, EventoUpdate, PaginatedEventos


def create_app() -> FastAPI:
    app = FastAPI(title="events-service")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    def _startup() -> None:
        # Similar to sequelize sync({ alter: true }) but safer: create if missing.
        Base.metadata.create_all(bind=engine)

    @app.get("/events", response_model=PaginatedEventos)
    def get_all_eventos(
        page: int = Query(default=1, ge=1),
        limit: int = Query(default=10, ge=1, le=100),
        tipo: str | None = None,
        status_param: str | None = Query(default=None, alias="status"),
        db: Session = Depends(get_db),
    ):
        stmt = select(Evento)
        if tipo:
            stmt = stmt.where(Evento.tipo == tipo)
        if status_param:
            stmt = stmt.where(Evento.status == status_param)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = db.execute(count_stmt).scalar_one()

        offset = (page - 1) * limit
        rows = (
            db.execute(stmt.order_by(asc(Evento.data_inicio)).limit(limit).offset(offset))
            .scalars()
            .all()
        )

        return {
            "total": total,
            "totalPages": (total + limit - 1) // limit,
            "currentPage": page,
            "data": rows,
        }

    @app.get("/events/{id}", response_model=EventoOut)
    def get_evento_by_id(id: int, db: Session = Depends(get_db)):
        evento = db.get(Evento, id)
        if not evento:
            raise HTTPException(status_code=404, detail="Evento não encontrado")
        return evento

    @app.post("/events", response_model=EventoOut, status_code=status.HTTP_201_CREATED)
    def create_evento(
        payload: EventoCreate,
        user=Depends(verify_token),
        db: Session = Depends(get_db),
    ):
        user = require_organizador(user)
        organizador_id = user.get("id")
        if organizador_id is None:
            raise HTTPException(status_code=401, detail="Token inválido ou expirado.")

        evento = Evento(
            nome=payload.nome,
            descricao=payload.descricao,
            data_inicio=payload.data_inicio,
            data_fim=payload.data_fim,
            local=payload.local,
            capacidade=payload.capacidade,
            preco=payload.preco,
            imagem=payload.imagem,
            tipo=payload.tipo,
            organizador_id=organizador_id,
        )

        db.add(evento)
        db.commit()
        db.refresh(evento)
        return evento

    @app.patch("/events/{id}", response_model=EventoOut)
    def update_evento(
        id: int,
        payload: EventoUpdate,
        user=Depends(verify_token),
        db: Session = Depends(get_db),
    ):
        user = require_organizador(user)
        evento = db.get(Evento, id)
        if not evento:
            raise HTTPException(status_code=404, detail="Evento não encontrado")

        # Node logic: allow organizer or admin
        if evento.organizador_id != user.get("id") and user.get("tipo") != "admin":
            raise HTTPException(
                status_code=403,
                detail="Não autorizado. Apenas o organizador ou admin podem editar este evento.",
            )

        data = payload.model_dump(exclude_unset=True)
        for k, v in data.items():
            setattr(evento, k, v)

        db.add(evento)
        db.commit()
        db.refresh(evento)
        return evento

    @app.delete("/events/{id}")
    def delete_evento(
        id: int,
        user=Depends(verify_token),
        db: Session = Depends(get_db),
    ):
        user = require_organizador(user)
        evento = db.get(Evento, id)
        if not evento:
            raise HTTPException(status_code=404, detail="Evento não encontrado")

        if evento.organizador_id != user.get("id") and user.get("tipo") != "admin":
            raise HTTPException(
                status_code=403,
                detail="Não autorizado. Apenas o organizador ou admin podem eliminar este evento.",
            )

        db.delete(evento)
        db.commit()
        return {"mensagem": "Evento apagado com sucesso"}

    return app


app = create_app()
