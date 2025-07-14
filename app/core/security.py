from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt

# Configurações
SECRET_KEY = "sua-chave-secreta-aqui"  # Coloque no .env
ALGORITHM = "HS256"
EXPIRA_MINUTOS = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def gerar_hash_senha(senha: str) -> str:
    return pwd_context.hash(senha)

def verificar_senha(senha: str, hash: str) -> bool:
    return pwd_context.verify(senha, hash)

def criar_token_dados(data: dict):
    dados = data.copy()
    expira = datetime.utcnow() + timedelta(minutes=EXPIRA_MINUTOS)
    dados.update({"exp": expira})
    return jwt.encode(dados, SECRET_KEY, algorithm=ALGORITHM)


def verificar_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        return user_id
    except JWTError:
        return None


