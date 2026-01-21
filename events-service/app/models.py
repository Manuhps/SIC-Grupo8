from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    Float,
    Integer,
    Numeric,
    String,
    Text,
    func,
)

from .db import Base


EventoTipo = Enum("cultural", "academico", "lazer", name="evento_tipo")
EventoStatus = Enum("agendado", "concluido", "cancelado", name="evento_status")
InscricaoStatus = Enum("pendente", "concluido", "cancelado", name="inscricao_status")


class Evento(Base):
    __tablename__ = "eventos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nome = Column(String(255), nullable=False)
    descricao = Column(Text, nullable=False)
    data_inicio = Column(DateTime, nullable=False)
    data_fim = Column(DateTime, nullable=True)
    local = Column(String(255), nullable=False)
    capacidade = Column(Integer, nullable=False)
    preco = Column(Float, nullable=False, default=0)
    tipo = Column(EventoTipo, nullable=False)
    imagem = Column(String(1024), nullable=True)
    organizador_id = Column(Integer, nullable=False)
    status = Column(EventoStatus, nullable=False, default="agendado")

    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())


class Inscricao(Base):
    """
    Modelo de Inscrição em Eventos.
    Chave primária composta por (evento_id, user_id).
    Em microserviços, não usamos foreign keys - apenas guardamos os IDs como referência.
    """
    __tablename__ = "inscricoes"

    evento_id = Column(Integer, primary_key=True, nullable=False)
    user_id = Column(Integer, primary_key=True, nullable=False)
    status = Column(InscricaoStatus, nullable=False, default="pendente")
    valor_pago = Column(Numeric(10, 2), nullable=False, default=0.00)

    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
