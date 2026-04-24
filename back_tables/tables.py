from sqlalchemy import Column, Integer, String, Date, Text, Boolean, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from database import Base

class Paciente(Base):
    __tablename__ = "paciente"

    id_paciente = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100))
    data_nascimento = Column(Date)
    email = Column(String, unique=True)
    cpf = Column(String, unique=True)
    endereco = Column(Text)
    telefone = Column(String)

class Usuario(Base):
    __tablename__ = "usuario"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index = True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    disabled = Column(Boolean, default=False)
    id_paciente = Column(Integer, ForeignKey("paciente.id_paciente"))

    paciente = relationship("Paciente")

class Prontuario(Base):
    __tablename__ = "prontuario"

    id_prontuario = Column(Integer, primary_key=True, index=True)
    id_paciente = Column(Integer, ForeignKey("paciente.id_paciente"))
    observacoes_gerais = Column(Text)

class Audio(Base):
    __tablename__ = "audio"  

    id_audio = Column(Integer, primary_key=True, index=True)

    nome_arquivo = Column(String, nullable=False)
    caminho = Column(String, nullable=False)
    duracao = Column(Integer)
    formato = Column(String(10))

class Consulta(Base):
    __tablename__ = "consulta"

    id_consulta = Column(Integer, primary_key=True, index=True)
    id_prontuario = Column(Integer, ForeignKey("prontuario.id_prontuario"))
    id_audio = Column(Integer, ForeignKey("audio.id_audio"))
    profissional = Column(String)
    motivo = Column(Text)