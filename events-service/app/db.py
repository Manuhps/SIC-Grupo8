import time
import logging

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from .config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _database_url() -> str:
    # Keep parity with Node service config/db.js
    return (
        f"mysql+pymysql://{settings.mysql_user}:{settings.mysql_password}"
        f"@{settings.mysql_host}/{settings.mysql_db}?charset=utf8mb4"
    )


def create_engine_with_retry(max_retries: int = 10, delay: int = 3):
    """Cria engine com retry logic para esperar pela base de dados."""
    for attempt in range(max_retries):
        try:
            eng = create_engine(_database_url(), pool_pre_ping=True)
            # Testa a conexão
            with eng.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Base de dados conectada com sucesso!")
            return eng
        except Exception as e:
            remaining = max_retries - attempt - 1
            logger.warning(f"Conexão falhou. Tentativas restantes: {remaining}. Erro: {e}")
            if remaining > 0:
                time.sleep(delay)
    raise Exception("Não foi possível conectar à base de dados após várias tentativas")


engine = create_engine_with_retry()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
