# app/models/usuarios.py
from pydantic import BaseModel, EmailStr
import uuid

class UserCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str

class UserLogin(BaseModel):
    email: EmailStr
    senha: str

class UserOut(BaseModel):
    id: uuid.UUID
    nome: str
    email: EmailStr

    class Config:
        from_attributes = True  # atualizado para Pydantic v2
