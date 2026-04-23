from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
import tables
from pydantic import BaseModel
# cria tabelas automaticamente (se não existirem)
Base.metadata.create_all(bind=engine)

class PacienteCreate(BaseModel):
    nome: str
    email:str

class RegisterRequest(BaseModel):
    id_paciente: int
    username: str
    senha: str


app = FastAPI()

# dependência de banco
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================
# CRIAR PACIENTE
# =========================
@app.post("/pacientes/")
def criar_paciente(dados: PacienteCreate, db: Session = Depends(get_db)):
    paciente = tables.Paciente(nome=dados.nome, email=dados.email)
    db.add(paciente)
    db.commit()
    db.refresh(paciente)
    return paciente

@app.post("/register/")
def register(data: RegisterRequest):
    # Aqui você salva no banco
    # (exemplo simples)

    return {
        "msg": "Conta criada com sucesso"
    }

# =========================
# LISTAR PACIENTES
# =========================
@app.get("/pacientes/")
def listar_pacientes(db: Session = Depends(get_db)):
    return db.query(tables.Paciente).all()