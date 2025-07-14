from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.security import verificar_token
from app.db.database import SessionLocal
from app.db import models
from uuid import UUID

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_usuario_logado(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user_id = verificar_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Token inválido")

    usuario = db.query(models.Usuario).filter(models.Usuario.id == UUID(user_id)).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    return usuario


