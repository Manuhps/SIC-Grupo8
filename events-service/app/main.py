from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import asc, desc, func, select
from sqlalchemy.orm import Session

from .auth import require_estudante, require_organizador, verify_token
from .db import Base, engine, get_db
from .models import Evento, Inscricao
from .schemas import (
    EventoCreate,
    EventoOut,
    EventoUpdate,
    InscricaoOut,
    InscricaoResponse,
    InscricaoUpdateStatus,
    PaginatedEventos,
    PaginatedInscricoes,
)


def create_app() -> FastAPI:
    app = FastAPI(
        title="events-service",
        description="API de Eventos e Inscrições - Python/FastAPI",
        version="2.0.0",
    )

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

    # ==================== ROTAS DE EVENTOS ====================

    @app.get("/events", response_model=PaginatedEventos)
    def get_all_eventos(
        page: int = Query(default=1, ge=1),
        limit: int = Query(default=10, ge=1, le=100),
        tipo: str | None = None,
        status_param: str | None = Query(default=None, alias="status"),
        db: Session = Depends(get_db),
    ):
        """Listar todos os eventos (público)."""
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
        """Obter um evento específico (público)."""
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
        """Criar um novo evento (apenas organizadores)."""
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
        """Atualizar um evento (organizador do evento ou admin)."""
        user = require_organizador(user)
        evento = db.get(Evento, id)
        if not evento:
            raise HTTPException(status_code=404, detail="Evento não encontrado")

        # Permitir apenas organizador do evento ou admin
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
        """Excluir um evento (organizador do evento ou admin)."""
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

    # ==================== ROTAS DE INSCRIÇÕES ====================

    @app.post("/events/{id}/inscrever", response_model=InscricaoResponse, status_code=status.HTTP_201_CREATED)
    def inscrever_em_evento(
        id: int,
        user=Depends(verify_token),
        db: Session = Depends(get_db),
    ):
        """Inscrever-se em um evento (apenas estudantes)."""
        user = require_estudante(user)
        user_id = user.get("id")

        # Verificar se o evento existe
        evento = db.get(Evento, id)
        if not evento:
            raise HTTPException(status_code=404, detail="Evento não encontrado")

        # Verificar se o evento está disponível para inscrições
        if evento.status != "agendado":
            raise HTTPException(
                status_code=400,
                detail="Este evento não está a aceitar inscrições."
            )

        # Verificar se já existe uma inscrição
        inscricao_existente = db.execute(
            select(Inscricao).where(
                Inscricao.evento_id == id,
                Inscricao.user_id == user_id
            )
        ).scalar_one_or_none()

        if inscricao_existente:
            raise HTTPException(
                status_code=400,
                detail="Já se encontra inscrito neste evento."
            )

        # Criar a inscrição
        inscricao = Inscricao(
            evento_id=id,
            user_id=user_id,
            valor_pago=evento.preco
        )

        db.add(inscricao)
        db.commit()
        db.refresh(inscricao)

        return {
            "message": "Inscrição efetuada com sucesso.",
            "inscricao": inscricao
        }

    @app.get("/events/{evento_id}/inscritos", response_model=PaginatedInscricoes)
    def get_all_inscricoes(
        evento_id: int,
        page: int = Query(default=1, ge=1),
        limit: int = Query(default=10, ge=1, le=100),
        user=Depends(verify_token),
        db: Session = Depends(get_db),
    ):
        """Listar todas as inscrições de um evento (apenas organizador do evento)."""
        user = require_organizador(user)

        # Verificar se o evento existe
        evento = db.get(Evento, evento_id)
        if not evento:
            raise HTTPException(status_code=404, detail="Evento não encontrado")

        # Verificar se o user é o organizador do evento
        if evento.organizador_id != user.get("id") and user.get("tipo") != "admin":
            raise HTTPException(
                status_code=403,
                detail="Apenas o organizador do evento pode ver as inscrições."
            )

        stmt = select(Inscricao).where(Inscricao.evento_id == evento_id)
        
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = db.execute(count_stmt).scalar_one()

        offset = (page - 1) * limit
        rows = (
            db.execute(stmt.order_by(desc(Inscricao.created_at)).limit(limit).offset(offset))
            .scalars()
            .all()
        )

        return {
            "total": total,
            "totalPages": (total + limit - 1) // limit,
            "currentPage": page,
            "data": rows,
        }

    @app.patch("/events/{evento_id}/inscricoes/{user_id}", response_model=InscricaoOut)
    def update_inscricao_status(
        evento_id: int,
        user_id: int,
        payload: InscricaoUpdateStatus,
        user=Depends(verify_token),
        db: Session = Depends(get_db),
    ):
        """Atualizar status de uma inscrição (apenas organizador do evento)."""
        user = require_organizador(user)

        # Verificar se o evento existe
        evento = db.get(Evento, evento_id)
        if not evento:
            raise HTTPException(status_code=404, detail="Evento não encontrado")

        # Verificar se o user é o organizador do evento
        if evento.organizador_id != user.get("id") and user.get("tipo") != "admin":
            raise HTTPException(
                status_code=403,
                detail="Apenas o organizador do evento pode atualizar inscrições."
            )

        # Buscar a inscrição
        inscricao = db.execute(
            select(Inscricao).where(
                Inscricao.evento_id == evento_id,
                Inscricao.user_id == user_id
            )
        ).scalar_one_or_none()

        if not inscricao:
            raise HTTPException(status_code=404, detail="Inscrição não encontrada")

        inscricao.status = payload.status
        db.add(inscricao)
        db.commit()
        db.refresh(inscricao)

        return inscricao

    @app.delete("/events/{evento_id}/inscricoes/{user_id}")
    def delete_inscricao(
        evento_id: int,
        user_id: int,
        user=Depends(verify_token),
        db: Session = Depends(get_db),
    ):
        """Apagar uma inscrição (apenas organizador do evento)."""
        user = require_organizador(user)

        # Verificar se o evento existe
        evento = db.get(Evento, evento_id)
        if not evento:
            raise HTTPException(status_code=404, detail="Evento não encontrado")

        # Verificar se o user é o organizador do evento
        if evento.organizador_id != user.get("id") and user.get("tipo") != "admin":
            raise HTTPException(
                status_code=403,
                detail="Apenas o organizador do evento pode apagar inscrições."
            )

        # Buscar a inscrição
        inscricao = db.execute(
            select(Inscricao).where(
                Inscricao.evento_id == evento_id,
                Inscricao.user_id == user_id
            )
        ).scalar_one_or_none()

        if not inscricao:
            raise HTTPException(status_code=404, detail="Inscrição não encontrada")

        db.delete(inscricao)
        db.commit()

        return {"mensagem": "Inscrição apagada com sucesso."}

    return app


app = create_app()
