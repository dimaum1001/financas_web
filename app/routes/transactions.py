# app/routes/transactions.py
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.models.transaction import TransactionCreate, TransactionOut
from app.db.models          import Transaction, Categoria
from app.db.database        import get_db
from app.core.deps          import get_usuario_logado   # retorna o usuário autenticado

router = APIRouter()


# ------------------------------------------------------------------ #
#  POST /transactions  – cria nova transação                          #
# ------------------------------------------------------------------ #
@router.post(
    "/",
    response_model=TransactionOut,
    status_code=status.HTTP_201_CREATED
)
def criar_transacao(
    transacao: TransactionCreate,
    db: Session = Depends(get_db),
    usuario     = Depends(get_usuario_logado)
):
    # 1) se a categoria ainda não existir para este usuário, cria
    existe = (
        db.query(Categoria)
        .filter(
            Categoria.nome == transacao.categoria,
            Categoria.tipo == transacao.tipo,
            Categoria.usuario_id == usuario.id
        )
        .first()
    )
    if existe is None:
        db.add(
            Categoria(
                nome=transacao.categoria,
                tipo=transacao.tipo,
                usuario_id=usuario.id
            )
        )
        db.commit()

    # 2) grava a transação (categoria em texto)
    nova = Transaction(
        descricao  = transacao.descricao,
        valor      = transacao.valor,
        tipo       = transacao.tipo,
        data       = transacao.data,
        categoria  = transacao.categoria,
        usuario_id = usuario.id
    )
    db.add(nova)
    db.commit()
    db.refresh(nova)

    return TransactionOut(**nova.__dict__)


# ------------------------------------------------------------------ #
#  GET /transactions  – lista transações do usuário logado           #
# ------------------------------------------------------------------ #
@router.get("/", response_model=List[TransactionOut])
def listar_transacoes(
    db: Session = Depends(get_db),
    usuario     = Depends(get_usuario_logado)
):
    transacoes = (
        db.query(Transaction)
        .filter(Transaction.usuario_id == usuario.id)
        .order_by(Transaction.data.desc())
        .all()
    )
    return [TransactionOut(**t.__dict__) for t in transacoes]
