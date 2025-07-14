# test_connection.py
from sqlalchemy import create_engine

DATABASE_URL = "postgresql://postgres.ofdhytvfnrgteavejrii:WzjINX3jGz6IZ2ci@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"

engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as conn:
        print("Conexão bem-sucedida!")
except Exception as e:
    print("Erro ao conectar:", e)
