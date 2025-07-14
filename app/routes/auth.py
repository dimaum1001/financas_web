# app/routes/auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# ----- Schemas (Pydantic) -----
from app.models.usuarios import UserCreate, UserLogin

# ----- Modelos ORM -----
from app.db.models import Usuario, Categoria          #  ⬅️  importamos Categoria!

# ----- utilidades de segurança -----
from app.core.security import (
    gerar_hash_senha,
    verificar_senha,
    criar_token_dados,
)

from app.core.deps import get_db

router = APIRouter()

# ---------- Categorias padrão ----------
DEFAULT_CATEGORIES = {
    "receita": [
        "Salário",
        "Freelance",
        "Rendimentos",
        "Investimentos",
    ],
    "despesa": [
        "Alimentação",
        "Transporte",
        "Moradia",
        "Lazer",
        "Educação",
        "Saúde",
        "Assinaturas",
        "Impostos",
    ],
}


def criar_categorias_padrao(usuario: Usuario, db: Session) -> None:
    """
    Insere categorias iniciais vinculadas ao novo usuário.
    """
    for tipo, nomes in DEFAULT_CATEGORIES.items():
        for nome in nomes:
            db.add(Categoria(nome=nome, tipo=tipo, usuario_id=usuario.id))
    # NÃO faz commit aqui – o commit global virá no register.
# --------------------------------------


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    # 1. verifica duplicidade de e‑mail
    if db.query(Usuario).filter(Usuario.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email já está em uso")

    # 2. cria usuário e faz flush para obter o UUID já gerado
    novo_usuario = Usuario(
        nome=user.nome,
        email=user.email,
        senha=gerar_hash_senha(user.senha),
    )
    db.add(novo_usuario)
    db.flush()                           # garante que novo_usuario.id existe

    # 3. gera categorias padrão
    criar_categorias_padrao(novo_usuario, db)

    # 4. efetiva tudo
    db.commit()
    db.refresh(novo_usuario)

    return {"msg": "Usuário cadastrado com sucesso 🎉"}


@router.post("/login")
def login(dados: UserLogin, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == dados.email).first()
    if not usuario or not verificar_senha(dados.senha, usuario.senha):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    token = criar_token_dados({"sub": str(usuario.id)})
    return {"access_token": token, "token_type": "bearer"}
