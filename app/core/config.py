from dotenv import load_dotenv
import os
from pathlib import Path

# Caminho correto para o .env dentro da pasta /app
dotenv_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=dotenv_path)

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL não configurada no .env")
