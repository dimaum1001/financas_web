from typing import Literal
import uuid
from pydantic import BaseModel, ConfigDict


class CategoriaBase(BaseModel):
    nome: str
    tipo: Literal["receita", "despesa"]
    grupo: str | None = None

class CategoriaCreate(CategoriaBase):
    pass

class CategoriaOut(CategoriaBase):
    id: uuid.UUID
    model_config = ConfigDict(from_attributes=True)
