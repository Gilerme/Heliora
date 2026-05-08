from pydantic import BaseModel, EmailStr, Field

class UserBase(BaseModel):
    email: EmailStr
    nome: str

class UserCreate(UserBase):
    senha: str = Field(..., min_length=8, max_length=72)
    cpf: str
    tipo_sanguineo: str | None = None

class PacienteResponse(BaseModel):
    id_paciente: int
    nome: str | None = None
    email: str | None = None
    cpf: str | None = None
    data_nascimento: str | None = None
    telefone: str | None = None
    endereco: str | None = None
    tipo_sanguineo: str | None = None
    peso: str | None = None
    altura: str | None = None
    foto_perfil: str | None = None

    class Config:
        from_attributes = True

class PacienteUpdate(BaseModel):
    nome: str | None = None
    email: str | None = None
    data_nascimento: str | None = None
    telefone: str | None = None
    endereco: str | None = None
    tipo_sanguineo: str | None = None
    peso: str | None = None
    altura: str | None = None
    foto_perfil: str | None = None

class UserResponse(UserBase):
    id: int
    id_paciente: int
    class Config:
        from_attributes = True # Antigo orm_mode=True

class Token(BaseModel):
    access_token: str
    token_type: str
    id_paciente: int | None = None

class TokenData(BaseModel):
    username: str | None = None