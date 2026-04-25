from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import tables
from database import SessionLocal, engine, Base
from sqlalchemy.orm import Session

Base.metadata.create_all(bind=engine)


SECRET_KEY = "83daa0256a2289b0fb23693bf1f6034d44396675749244721a2b20e896e11662"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class RegisterRequest(BaseModel):
    email: str
    nome: str
    senha: str

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None


class User(BaseModel):
    username: str
    email: str | None = None
    full_name: str | None = None
    disabled: bool | None = None


class UserInDB(User):
    hashed_password: str


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app = FastAPI()


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def verify_password(plain_password, hashed_password):
    senha_bytes = plain_password.encode("utf-8")[:72]
    senha_truncada = senha_bytes.decode("utf-8", errors="ignore")
    return pwd_context.verify(senha_truncada, hashed_password)

def hash_senha_segura(senha: str):
    senha_bytes = senha.encode("utf-8")[:72]
    senha_truncada = senha_bytes.decode("utf-8", errors="ignore")
    return pwd_context.hash(senha_truncada)

def get_user(db: Session, username: str):
    return db.query(tables.Usuario).filter(
        tables.Usuario.username == username
    ).first()


def authenticate_user(db: Session, username: str, password: str):
    user = db.query(tables.Usuario).filter(
        tables.Usuario.username == username
    ).first()

    if not user:
        return False

    if not pwd_context.verify(password, user.hashed_password):
        return False

    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credential_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")

        if username is None:
            raise credential_exception

        token_data = TokenData(username=username)

    except JWTError:
        raise credential_exception

    user = get_user(db, username=token_data.username)

    if user is None:
        raise credential_exception

    return user


async def get_current_active_user(current_user: UserInDB = Depends(get_current_user)):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")

    return current_user


@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)

    if not user:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    access_token = create_access_token(data={"sub": user.username})

    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/me")
def get_me(current_user: tables.Usuario = Depends(get_current_user)):
    return current_user


@app.get("/users/me/items")
async def read_own_items(current_user: User = Depends(get_current_active_user)):
    return [{"item_id": 1, "owner": current_user}]

@app.post("/register")
def register(dados: RegisterRequest, db: Session = Depends(get_db)):

    # valida tamanho da senha
    if len(dados.senha.encode("utf-8")) > 72:
        raise HTTPException(status_code=400, detail="Senha muito longa")

    # verifica usuário
    user_existente = db.query(tables.Usuario).filter(
        tables.Usuario.email == dados.email
    ).first()

    if user_existente:
        return {"erro": "Usuário já existe"}

    # cria paciente
    paciente = tables.Paciente(
        nome=dados.nome,
        email=dados.email
    )

    db.add(paciente)
    db.commit()
    db.refresh(paciente)
    print(dados.senha)
    print(type(dados.senha))
    # cria usuário
    usuario = tables.Usuario(
        email=dados.email,
        username=dados.email,
        hashed_password=hash_senha_segura(dados.senha),
        id_paciente=paciente.id_paciente
    )

    db.add(usuario)
    db.commit()

    return {"msg": "Conta criada com sucesso"}