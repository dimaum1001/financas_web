# app/routes/categorias.py
from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from typing import List

from app.core.deps   import get_db, get_usuario_logado
from app.db.models   import Categoria
from pydantic        import BaseModel

router = APIRouter()


# ------------------------ Schemas ------------------------ #
class CategoriaCreate(BaseModel):
    nome: str
    tipo: str            # 'receita' ou 'despesa'

class CategoriaOut(CategoriaCreate):
    id: int

    class Config:
        from_attributes = True
# --------------------------------------------------------- #


# GET /categorias/{tipo}
@router.get("/{tipo}", response_model=List[CategoriaOut])
def listar_categorias(
    tipo: str = Path(..., regex="^(receita|despesa)$"),
    db: Session = Depends(get_db),
    usuario = Depends(get_usuario_logado)
):
    return (
        db.query(Categoria)
        .filter(Categoria.usuario_id == usuario.id, Categoria.tipo == tipo)
        .order_by(Categoria.nome)
        .all()
    )


# POST /categorias
@router.post("/", response_model=CategoriaOut, status_code=201)
def criar_categoria(
    categoria: CategoriaCreate,
    db: Session = Depends(get_db),
    usuario = Depends(get_usuario_logado)
):
    existe = (
        db.query(Categoria)
        .filter(
            Categoria.nome == categoria.nome,
            Categoria.tipo == categoria.tipo,
            Categoria.usuario_id == usuario.id
        )
        .first()
    )
    if existe:
        raise HTTPException(status_code=400, detail="Categoria já existe.")

    nova = Categoria(
        nome=categoria.nome,
        tipo=categoria.tipo,
        usuario_id=usuario.id
    )
    db.add(nova)
    db.commit()
    db.refresh(nova)
    return nova
