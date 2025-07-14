# app/models/transaction.py
from datetime import date
from pydantic import BaseModel, ConfigDict
from typing import Optional

class TransactionCreate(BaseModel):
    tipo: str
    categoria: str
    valor: float
    data: date
    descricao: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class TransactionOut(TransactionCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)
