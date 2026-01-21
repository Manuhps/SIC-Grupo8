from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


EventoTipo = Literal["cultural", "academico", "lazer"]
EventoStatus = Literal["agendado", "concluido", "cancelado"]


class EventoBase(BaseModel):
    nome: str
    descricao: str
    data_inicio: datetime
    data_fim: Optional[datetime] = None
    local: str
    capacidade: int = Field(ge=1)
    preco: float = Field(default=0, ge=0)
    imagem: Optional[str] = None
    tipo: EventoTipo


class EventoCreate(EventoBase):
    pass


class EventoUpdate(BaseModel):
    nome: Optional[str] = None
    descricao: Optional[str] = None
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None
    local: Optional[str] = None
    capacidade: Optional[int] = Field(default=None, ge=1)
    preco: Optional[float] = Field(default=None, ge=0)
    tipo: Optional[EventoTipo] = None
    imagem: Optional[str] = None
    status: Optional[EventoStatus] = None


class EventoOut(BaseModel):
    id: int
    nome: str
    descricao: str
    data_inicio: datetime
    data_fim: Optional[datetime]
    local: str
    capacidade: int
    preco: float
    tipo: EventoTipo
    imagem: Optional[str]
    organizador_id: int
    status: EventoStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PaginatedEventos(BaseModel):
    total: int
    totalPages: int
    currentPage: int
    data: list[EventoOut]
