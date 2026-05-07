from sqlalchemy.orm import Session

from . import auth, models
from . import schemas

def get_user_by_email(db: Session, email: str):
    return db.query(models.Usuario).filter(models.Usuario.email == email).first()

def create_user_and_patient(db: Session, user_data: UserCreate):
    # 1. Cria Paciente
    db_paciente = models.Paciente(
        nome=user_data.nome,
        email=user_data.email,
        cpf=user_data.cpf.replace(".", "").replace("-", "")
    )
    db.add(db_paciente)
    db.commit()
    db.refresh(db_paciente)

    # 2. Cria Usuário
    db_user = models.Usuario(
        email=user_data.email,
        username=user_data.email,
        hashed_password=auth.get_password_hash(user_data.senha),
        id_paciente=db_paciente.id_paciente
    )
    db.add(db_user)
    db.commit()
    return db_user