import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Lógica para carregar o .env que corrigimos antes
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(BASE_DIR, "..", ".env")
load_dotenv(dotenv_path=ENV_PATH)

DATABASE_URL = "postgresql://neondb_owner:npg_SpRQUAW73LVt@ep-square-base-anlme6n7-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require"

engine = create_engine(
    DATABASE_URL,
    connect_args={"sslmode": "require"}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ESTA É A FUNÇÃO QUE ESTÁ FALTANDO:
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()