"""
heliora — Transcription Service
--------------------------------
Uses OpenAI Whisper (local) to transcribe audio from medical consultations.
Audio never leaves the device, keeping patient data private.
"""

import os
import tempfile
import whisper
from pathlib import Path

# ---------------------------------------------------------------------------
# Model loading
# ---------------------------------------------------------------------------
# Whisper model sizes (trade-off: speed vs accuracy):
#   "tiny"   → fastest,  lowest accuracy
#   "base"   → fast,     good accuracy      ← recommended for development
#   "small"  → balanced                     ← recommended for staging
#   "medium" → slower,   great accuracy     ← recommended for production
#   "large"  → slowest,  best accuracy

_MODEL_SIZE = os.getenv("WHISPER_MODEL", "base")
_model: whisper.Whisper | None = None


def _get_model() -> whisper.Whisper:
    """Lazily load and cache the Whisper model."""
    global _model
    if _model is None:
        print(f"[heliora] Loading Whisper model '{_MODEL_SIZE}'…")
        _model = whisper.load_model(_MODEL_SIZE)
        print(f"[heliora] Whisper model ready.")
    return _model


# ---------------------------------------------------------------------------
# Core transcription
# ---------------------------------------------------------------------------

def transcribe_audio(
    audio_bytes: bytes,
    filename: str,
    language: str | None = None,
) -> dict:
    """
    Transcribe audio bytes to text using Whisper.

    Args:
        audio_bytes: Raw audio content (mp3, wav, m4a, ogg, webm, etc.)
        filename:    Original filename — used to preserve the file extension.
        language:    ISO 639-1 language code (e.g. "pt" for Portuguese,
                     "en" for English). If None, Whisper auto-detects.

    Returns:
        {
            "text":     str,           # Full transcript
            "language": str,           # Detected/used language code
            "segments": list[dict],    # Word-level timing info
            "duration": float,         # Audio duration in seconds
        }
    """
    suffix = Path(filename).suffix or ".wav"

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        model = _get_model()

        # Whisper options
        options: dict = {}
        if language:
            options["language"] = language

        result = model.transcribe(tmp_path, **options)

        return {
            "text": result["text"].strip(),
            "language": result.get("language", language or "unknown"),
            "segments": _clean_segments(result.get("segments", [])),
            "duration": _get_duration(result.get("segments", [])),
        }

    finally:
        os.unlink(tmp_path)  # Always delete temp file


def _clean_segments(segments: list) -> list:
    """Return only the fields useful to the frontend."""
    return [
        {
            "id": seg["id"],
            "start": round(seg["start"], 2),
            "end": round(seg["end"], 2),
            "text": seg["text"].strip(),
        }
        for seg in segments
    ]


def _get_duration(segments: list) -> float:
    """Estimate total audio duration from the last segment's end time."""
    if not segments:
        return 0.0
    return round(segments[-1]["end"], 2)