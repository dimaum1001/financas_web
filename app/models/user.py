from pydantic import BaseModel, EmailStr
from app.db.database import Base
from uuid import UUID

class UserCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str

class UserLogin(BaseModel):
    email: EmailStr
    senha: str

class UserOut(BaseModel):
    id: UUID
    nome: str
    email: EmailStr

    class Config:
        orm_mode = True
