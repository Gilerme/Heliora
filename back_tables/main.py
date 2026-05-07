from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
import shutil
import os
from groq import Groq
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from . import models, schemas, auth, database
from sqlalchemy.exc import IntegrityError
from datetime import datetime

models.Base.metadata.create_all(bind=database.engine)
app = FastAPI()

BASE_UPLOAD_DIR = "uploads"
AUDIOS_DIR = os.path.join(BASE_UPLOAD_DIR, "audios")
EXAMES_DIR = os.path.join(BASE_UPLOAD_DIR, "exames")
VACINAS_DIR = os.path.join(BASE_UPLOAD_DIR, "vacinas")

# Cria as pastas na raiz do projeto se elas não existirem
for folder in [BASE_UPLOAD_DIR, AUDIOS_DIR, EXAMES_DIR, VACINAS_DIR]:
    if not os.path.exists(folder):
        os.makedirs(folder)

@app.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    try:
    # cria paciente
        new_paciente = models.Paciente(
            nome=user.nome,
            email=user.email,
            cpf=user.cpf,
            tipo_sanguineo=user.tipo_sanguineo
        )
        db.add(new_paciente)
        db.flush()  # 🔥 pega o ID sem commit

        # cria usuário
        new_user = models.Usuario(
            email=user.email,
            hashed_password=auth.get_password_hash(user.senha),
            id_paciente=new_paciente.id_paciente
        )
        db.add(new_user)

        db.commit()  # 🔥 UM commit só
        return {"message": "Usuário criado com sucesso!"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/token", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.Usuario).filter(models.Usuario.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorreto")
    
    access_token = auth.create_access_token(data={"sub": user.username or user.email})
    return {"access_token": access_token, "token_type": "bearer", "id_paciente": user.id_paciente}

class RecuperarSenhaRequest(schemas.BaseModel):
    email: str

@app.post("/esqueci-senha")
def esqueci_senha(request: RecuperarSenhaRequest, db: Session = Depends(database.get_db)):
    user = db.query(models.Usuario).filter(models.Usuario.email == request.email).first()
    if not user:
        return {"message": "Se o e-mail existir, um link de recuperação será enviado."}
    
    print(f"SIMULAÇÃO: Link de recuperação de senha enviado para {request.email}")
    return {"message": "Se o e-mail existir, um link de recuperação será enviado."}

@app.get("/pacientes/{paciente_id}", response_model=schemas.PacienteResponse)
def obter_paciente(paciente_id: int, db: Session = Depends(database.get_db)):
    paciente = db.query(models.Paciente).filter(models.Paciente.id_paciente == paciente_id).first()
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente não encontrado")
    return paciente

@app.put("/pacientes/{paciente_id}")
def atualizar_paciente(paciente_id: int, dados: schemas.PacienteUpdate, db: Session = Depends(database.get_db)):
    paciente = db.query(models.Paciente).filter(models.Paciente.id_paciente == paciente_id).first()
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente não encontrado")
    
    update_data = dados.model_dump(exclude_unset=True) # model_dump is pydantic v2
    if hasattr(dados, "dict"): # Fallback for pydantic v1
        update_data = dados.dict(exclude_unset=True)
        
    for key, value in update_data.items():
        setattr(paciente, key, value)
        
    db.commit()
    db.refresh(paciente)
    return {"message": "Paciente atualizado com sucesso"}

@app.post("/pacientes/{paciente_id}/alergias")
def adicionar_alergia(paciente_id: int, nome: str, db: Session = Depends(database.get_db)):
    nova_alergia = models.Alergia(nome_alergia=nome, id_paciente=paciente_id)
    db.add(nova_alergia)
    db.commit()
    db.refresh(nova_alergia)
    return {"message": "Alergia registrada", "id": nova_alergia.id, "nome": nome}

@app.get("/pacientes/{paciente_id}/alergias")
def listar_alergias(paciente_id: int, db: Session = Depends(database.get_db)):
    alergias = db.query(models.Alergia).filter(models.Alergia.id_paciente == paciente_id).all()
    return [{"id": a.id, "nome": a.nome_alergia} for a in alergias]

@app.post("/pacientes/{paciente_id}/condicao")
def adicionar_condicao(paciente_id: int, nome: str, db: Session = Depends(database.get_db)):
    nova_condicao = models.DoencaCronica(nome_doenca=nome, id_paciente=paciente_id)
    db.add(nova_condicao)
    db.commit()
    db.refresh(nova_condicao)
    return {"message": "Condição registrada", "id": nova_condicao.id, "nome": nome}

@app.get("/pacientes/{paciente_id}/condicao")
def listar_condicoes(paciente_id: int, db: Session = Depends(database.get_db)):
    condicoes = db.query(models.DoencaCronica).filter(models.DoencaCronica.id_paciente == paciente_id).all()
    return [{"id": c.id, "nome": c.nome_doenca} for c in condicoes]

@app.post("/pacientes/{paciente_id}/exames")
async def upload_exame_pdf(
    laboratorio: str,
    paciente_id: int, 
    nome_exame: str,
    file: UploadFile = File(...), 
    db: Session = Depends(database.get_db)
):
    # 1. Validar se é PDF ou Imagem
    allowed_types = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="O arquivo deve ser um PDF ou uma imagem (JPEG/PNG).")

    # 2. Criar nome único para evitar sobrescrever arquivos com nomes iguais
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    nome_arquivo = f"exame_{paciente_id}_{timestamp}_{file.filename}"
    file_path = os.path.join(EXAMES_DIR, nome_arquivo)

    # 3. Salvar PDF no disco
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 4. Salvar referência no banco de dados
        novo_exame = models.Exame(
            nome_exame=nome_exame,
            laboratorio=laboratorio,
            caminho_pdf=file_path,
            id_paciente=paciente_id
        )
        db.add(novo_exame)
        db.commit()
        db.refresh(novo_exame)

        return {"message": "Exame salvo com sucesso!", "caminho": file_path, "id_exame": novo_exame.id_exame}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar PDF: {e}")
    
@app.post("/pacientes/{paciente_id}/vacinas")
async def upload_vacina_pdf(
    local: str,
    paciente_id: int, 
    nome_vacina: str,
    file: UploadFile = File(...), 
    db: Session = Depends(database.get_db)
):
    # 1. Validar se é PDF ou Imagem
    allowed_types = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="O arquivo deve ser um PDF ou uma imagem (JPEG/PNG).")

    # 2. Criar nome único para evitar sobrescrever arquivos com nomes iguais
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    nome_arquivo = f"vacina_{paciente_id}_{timestamp}_{file.filename}"
    file_path = os.path.join(VACINAS_DIR, nome_arquivo)

    # 3. Salvar PDF no disco
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 4. Salvar referência no banco de dados
        nova_vacina = models.Vacina(
            nome_vacina=nome_vacina,
            local=local,
            caminho_pdf=file_path,
            id_paciente=paciente_id
        )
        db.add(nova_vacina)
        db.commit()
        db.refresh(nova_vacina)

        return {"message": "Vacina salva com sucesso!", "caminho": file_path, "id_vacinas": nova_vacina.id_vacinas}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar PDF: {e}")

@app.get("/pacientes/{paciente_id}/vacinas")
def listar_vacinas(paciente_id: int, db: Session = Depends(database.get_db)):
    vacinas = db.query(models.Vacina).filter(models.Vacina.id_paciente == paciente_id).all()
    return [
        {
            "id": v.id_vacinas,
            "titulo": v.nome_vacina,
            "local": v.local,
            "data": v.data_upload.strftime("%d/%m/%Y") if v.data_upload else "",
            "tipo": "Vacina"
        }
        for v in vacinas
    ]
    
@app.post("/pacientes/{paciente_id}/consultas")
async def criar_consulta_com_audio(
    paciente_id: int,
    nome: str = Form(...),
    data: str = Form(...),
    profissional: str = Form(...),
    audio_file: UploadFile = File(None),
    db: Session = Depends(database.get_db)
):
    # 1. Criar primeiro o registro da Consulta
    nova_consulta = models.Consulta(
        nome_consulta=nome,
        data_consulta=datetime.strptime(data, "%Y-%m-%d"),
        profissional=profissional,
        id_paciente=paciente_id
    )
    db.add(nova_consulta)
    db.commit()
    db.refresh(nova_consulta)

    # 2. Processar o Arquivo de Áudio, se existir
    transcricao_texto = ""
    if audio_file:
        formato = audio_file.filename.split('.')[-1]
        nome_unico = f"audio_cons_{nova_consulta.id_consulta}_{audio_file.filename}"
        caminho_completo = os.path.join(AUDIOS_DIR, nome_unico)

        try:
            # Salva fisicamente
            with open(caminho_completo, "wb") as buffer:
                shutil.copyfileobj(audio_file.file, buffer)

            # 3. Transcrição via Groq
            # Aqui simulamos ou usamos caso esteja configurado
            # with open(caminho_completo, "rb") as f:
            #     transcription = client.audio.transcriptions.create(
            #         file=(nome_unico, f.read()),
            #         model="whisper-large-v3",
            #         language="pt"
            #     )
            # transcricao_texto = transcription.text
            transcricao_texto = "Transcrição não implementada ainda no Scribe."

            # 4. Criar o registro na tabela Audio (sua tabela específica)
            novo_audio = models.Audio(
                nome_arquivo=nome_unico,
                transcricao=transcricao_texto,
                caminho=caminho_completo,
                duracao=0, # Se precisar da duração real, precisaria da lib 'pydub'
                formato=formato,
                id_consulta=nova_consulta.id_consulta # Aqui acontece a mágica do vínculo
            )
            
            db.add(novo_audio)
            db.commit()

        except Exception as e:
            db.delete(nova_consulta) # Rollback manual se o áudio falhar
            db.commit()
            if os.path.exists(caminho_completo):
                os.remove(caminho_completo)
            raise HTTPException(status_code=500, detail=f"Erro ao processar áudio: {str(e)}")

    return {
        "status": "Consulta registrada",
        "id_consulta": nova_consulta.id_consulta,
        "transcricao": transcricao_texto
    }

@app.get("/pacientes/{paciente_id}/consultas")
def listar_consultas(paciente_id: int, db: Session = Depends(database.get_db)):
    consultas = db.query(models.Consulta).filter(models.Consulta.id_paciente == paciente_id).all()
    return [
        {
            "id": c.id_consulta,
            "titulo": c.nome_consulta,
            "local": c.profissional,
            "data": c.data_consulta.strftime("%d/%m/%Y") if c.data_consulta else "",
            "tipo": "Consulta"
        }
        for c in consultas
    ]