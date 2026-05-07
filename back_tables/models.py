from sqlalchemy import Column, Integer, String, Date, Text, Boolean, ForeignKey, TIMESTAMP, DateTime
from sqlalchemy.orm import relationship
from back_tables.database import Base
from datetime import datetime

class Paciente(Base):
    __tablename__ = "paciente"

    id_paciente = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100))
    data_nascimento = Column(String(100))
    email = Column(String, unique=True)
    cpf = Column(String, unique=True)
    endereco = Column(Text)
    telefone = Column(String)
    tipo_sanguineo = Column(String(10))
    peso = Column(String(20))
    altura = Column(String(20))
    foto_perfil = Column(Text)

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

class Alergia(Base):
    __tablename__ = "alergias"
    id = Column(Integer, primary_key=True)
    nome_alergia = Column(String(100), nullable=False)
    id_paciente = Column(Integer, ForeignKey("paciente.id_paciente"))

class DoencaCronica(Base):
    __tablename__ = "doencas_cronicas"
    id = Column(Integer, primary_key=True)
    nome_doenca = Column(String(100), nullable=False)
    id_paciente = Column(Integer, ForeignKey("paciente.id_paciente"))

class Exame(Base):
    __tablename__ = "exames"

    id_exame = Column(Integer, primary_key=True, index=True)
    nome_exame = Column(String(100)) # Ex: Hemograma, Raio-X
    laboratorio = Column(String(100))
    caminho_pdf = Column(String(255)) # Localização do arquivo no servidor
    data_upload = Column(DateTime, default=datetime.utcnow)
    
    id_paciente = Column(Integer, ForeignKey("paciente.id_paciente"))

class Vacina(Base):
    __tablename__ = "vacinas"

    id_vacinas = Column(Integer, primary_key=True, index=True)
    nome_vacina = Column(String(100)) # Ex: Hemograma, Raio-X
    local = Column(String(100))
    caminho_pdf = Column(String(255)) # Localização do arquivo no servidor
    data_upload = Column(DateTime, default=datetime.utcnow)
    
    id_paciente = Column(Integer, ForeignKey("paciente.id_paciente"))

class Consulta(Base):
    __tablename__ = "consultas"

    id_consulta = Column(Integer, primary_key=True, index=True)
    nome_consulta = Column(String(100))
    data_consulta = Column(DateTime)
    profissional = Column(String(100))
    id_paciente = Column(Integer, ForeignKey("paciente.id_paciente"))

    # Relacionamento: Uma consulta tem um áudio
    # uselist=False garante que seja 1 para 1
    audio = relationship("Audio", back_populates="consulta", uselist=False)
    anexos = relationship("AnexoConsulta", back_populates="consulta")

class Audio(Base):
    __tablename__ = "audio"

    id_audio = Column(Integer, primary_key=True, index=True)
    nome_arquivo = Column(String, nullable=False)
    transcricao = Column(Text, nullable=True)
    caminho = Column(String, nullable=False)
    duracao = Column(Integer)
    formato = Column(String(10))
    
    # Chave estrangeira para ligar à Consulta
    id_consulta = Column(Integer, ForeignKey("consultas.id_consulta"))
    consulta = relationship("Consulta", back_populates="audio")

class AnexoConsulta(Base):
    __tablename__ = "anexos_consulta"

    id_anexo = Column(Integer, primary_key=True, index=True)
    caminho_pdf = Column(String(255), nullable=False)
    
    # Chave estrangeira para a consulta
    id_consulta = Column(Integer, ForeignKey("consultas.id_consulta"))
    
    # Relacionamento reverso
    consulta = relationship("Consulta", back_populates="anexos")