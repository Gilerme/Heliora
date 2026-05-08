"""
heliora — FastAPI Application
------------------------------
Exposes two main feature endpoints:
  POST /transcribe  → Audio → Text (Whisper)
  POST /chat        → Conversational medical assistant (Claude / Heli)

Run locally:
    uvicorn main:app --reload
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from services.transcription import transcribe_audio, _get_model
from services.chatbot import chat


# ---------------------------------------------------------------------------
# App lifecycle — pre-load Whisper on startup so the first request is fast
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    _get_model()  # Warm up Whisper
    yield


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

app = FastAPI(
    title="heliora API",
    description="Personal health record platform — transcription & medical assistant.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/health", tags=["System"])
def health():
    return {"status": "ok", "service": "heliora"}


# ---------------------------------------------------------------------------
# Feature 1 — Transcription
# ---------------------------------------------------------------------------

@app.post("/transcribe", tags=["Transcription"])
async def transcribe(
    file: UploadFile = File(..., description="Audio file from the consultation."),
    language: str | None = Form(
        default=None,
        description="ISO 639-1 language code (e.g. 'pt', 'en'). "
                    "Leave empty for auto-detection.",
    ),
):
    """
    Transcribe a medical consultation audio file.

    - Accepts: mp3, wav, m4a, ogg, webm
    - Returns: full transcript text + timestamped segments

    The audio is processed locally and never sent to an external server.
    """
    SUPPORTED_TYPES = {
        "audio/mpeg", "audio/wav", "audio/x-wav",
        "audio/mp4", "audio/m4a", "audio/ogg",
        "audio/webm", "video/webm",
    }

    if file.content_type and file.content_type not in SUPPORTED_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported media type: {file.content_type}. "
                   f"Supported: mp3, wav, m4a, ogg, webm.",
        )

    audio_bytes = await file.read()

    if len(audio_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        result = transcribe_audio(
            audio_bytes=audio_bytes,
            filename=file.filename or "audio.wav",
            language=language,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Transcription failed: {str(exc)}",
        )

    return {
        "transcript": result["text"],
        "language": result["language"],
        "duration_seconds": result["duration"],
        "segments": result["segments"],
    }


# ---------------------------------------------------------------------------
# Feature 2 — Medical Chatbot (Heli)
# ---------------------------------------------------------------------------

class Message(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]
    consultation_transcript: str | None = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "messages": [
                    {"role": "user", "content": "What does 'hypertension' mean?"}
                ],
                "consultation_transcript": None,
            }
        }
    }


@app.post("/chat", tags=["Chatbot"])
def chat_endpoint(request: ChatRequest):
    """
    Chat with Heli, heliora's medical assistant.

    - Send the full conversation history on every request (Claude is stateless).
    - Optionally attach a consultation transcript so Heli can answer
      questions specific to what the doctor said.
    - Heli replies in the same language the patient uses.
    """
    if not request.messages:
        raise HTTPException(status_code=400, detail="'messages' cannot be empty.")

    valid_roles = {"user", "assistant"}
    for msg in request.messages:
        if msg.role not in valid_roles:
            raise HTTPException(
                status_code=422,
                detail=f"Invalid role '{msg.role}'. Must be 'user' or 'assistant'.",
            )

    # Convert Pydantic models → plain dicts for the Anthropic SDK
    messages_payload = [{"role": m.role, "content": m.content} for m in request.messages]

    try:
        result = chat(
            messages=messages_payload,
            consultation_transcript=request.consultation_transcript,
        )
    except EnvironmentError as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Chatbot error: {str(exc)}",
        )

    return {
        "reply": result["reply"],
        "usage": {
            "input_tokens": result["input_tokens"],
            "output_tokens": result["output_tokens"],
        },
    }