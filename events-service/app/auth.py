from typing import Any, Dict

from fastapi import Header, HTTPException, status
from jose import JWTError, jwt

from .config import settings


def _unauthorized(detail: str):
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


def _forbidden(detail: str):
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


def verify_token(authorization: str | None = Header(default=None)) -> Dict[str, Any]:
    if not authorization:
        _unauthorized("Token não fornecido.")

    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        _unauthorized("Token inválido ou expirado.")

    token = parts[1]

    try:
        decoded = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        return decoded
    except JWTError:
        _unauthorized("Token inválido ou expirado.")


def require_organizador(user: Dict[str, Any]) -> Dict[str, Any]:
    user_type = user.get("tipo")
    if user_type not in ("organizador", "admin"):
        _forbidden(
            "Acesso negado. Apenas organizadores ou administradores podem aceder a este recurso."
        )
    return user
