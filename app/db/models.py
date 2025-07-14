# app/db/models.py
import uuid
from datetime import datetime, date

from sqlalchemy import (
    Column, Integer, String, Float, Date, DateTime, ForeignKey
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id        = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome      = Column(String,  nullable=False)
    email     = Column(String,  unique=True, index=True, nullable=False)
    senha     = Column(String,  nullable=False)
    criado_em = Column(DateTime, default=datetime.utcnow)

    # ---------- RELACIONAMENTOS ----------
    transacoes = relationship(
        "Transaction",
        back_populates="usuario",
        cascade="all, delete-orphan"
    )
    categorias = relationship(
        "Categoria",
        back_populates="usuario",
        cascade="all, delete-orphan"
    )


class Categoria(Base):
    """
    Mantemos uma tabela de categorias para o usuário poder listar,
    mas NÃO há FK na transação – o campo continua puro texto.
    """
    __tablename__ = "categorias"

    id         = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nome       = Column(String, nullable=False)
    tipo       = Column(String, nullable=False)               # 'receita' ou 'despesa'
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"))

    usuario = relationship("Usuario", back_populates="categorias")


class Transaction(Base):
    __tablename__ = "transacoes"

    id        = Column(Integer, primary_key=True, index=True, autoincrement=True)
    descricao = Column(String, nullable=True)
    valor     = Column(Float,  nullable=False)
    tipo      = Column(String, nullable=False)                # 'receita' ou 'despesa'
    data      = Column(Date,   nullable=False)

    # -------------- ponto chave ---------------
    categoria = Column(String, nullable=False)                # <-- texto
    # ------------------------------------------

    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"))

    # ---------- RELACIONAMENTOS ----------
    usuario = relationship("Usuario", back_populates="transacoes")
