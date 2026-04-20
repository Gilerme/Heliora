from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
import tables
# cria tabelas automaticamente (se não existirem)
Base.metadata.create_all(bind=engine)

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
def criar_paciente(nome: str, email: str, senha: str, db: Session = Depends(get_db)):
    paciente = tables.Paciente(nome=nome, email=email, )
    senha_cad = tables.login(senha=senha)
    db.add(paciente)
    db.add(senha_cad)
    db.commit()
    db.refresh(paciente)
    db.refresh(senha_cad)
    return paciente, senha_cad


# =========================
# LISTAR PACIENTES
# =========================
@app.get("/pacientes/")
def listar_pacientes(db: Session = Depends(get_db)):
    return db.query(tables.Paciente).all()