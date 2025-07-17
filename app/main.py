from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, transactions
from app.routes import categorias
from app.db.database import engine, Base
from dotenv import load_dotenv
import os

# ✅ Carrega as variáveis de ambiente do .env
load_dotenv()

# Debug temporário: verifica se DATABASE_URL foi carregada corretamente
print("🌐 DATABASE_URL:", os.getenv("DATABASE_URL"))

# ✅ Tenta criar as tabelas
try:
    print("🔁 Tentando conectar ao banco de dados e criar tabelas...")
   # Base.metadata.create_all(bind=engine)
    print("✅ Conexão com banco bem-sucedida.")
except Exception as e:
    print("❌ Erro ao conectar ou criar tabelas no banco:")
    print(e)

# ✅ Instância da aplicação
app = FastAPI(title="Gestão Financeira Pessoal")

# ✅ CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://financas-eh402zgg2-dimaum1001s-projects.vercel.app" ,
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Rotas
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
app.include_router(categorias.router, prefix="/categorias", tags=["Categorias"])

# ✅ Rota raiz
@app.get("/")
def home():
    return {"mensagem": "API de Gestão Financeira rodando com sucesso 🚀"}
