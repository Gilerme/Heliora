"""
heliora — Medical Chatbot Service
-----------------------------------
Uses Google Gemini 2.5 Flash (free tier via Google AI Studio) to power Heli,
heliora's health assistant. Heli explains medical terms and consultation
summaries in plain language, always reminding patients that it is not a
substitute for professional advice.

Free tier limits (Google AI Studio):
  - 10 requests per minute
  - ~500 requests per day
  Enough for development and small-scale production use.
"""

import os
from typing import Optional
import google.generativeai as genai


# ---------------------------------------------------------------------------
# Client setup
# ---------------------------------------------------------------------------

_model: genai.GenerativeModel | None = None


def _get_model() -> genai.GenerativeModel:
    """Lazily configure and return the Gemini model."""
    global _model
    if _model is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise EnvironmentError(
                "GEMINI_API_KEY environment variable is not set.\n"
                "Get your free key at: https://aistudio.google.com/app/apikey"
            )
        genai.configure(api_key=api_key)
        _model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            system_instruction=_BASE_SYSTEM_PROMPT,
        )
    return _model


# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------

_BASE_SYSTEM_PROMPT = """
You are Heli, a warm and knowledgeable health companion inside the heliora app.
Heliora is a personal health record platform that helps patients — especially
those managing chronic conditions or attending regular check-ups — understand
their medical journey in a clear, private, and organised way.

YOUR ROLE:
- Explain medical terms, diagnoses, procedures, and medication names in plain,
  friendly language that anyone can understand — no medical background required.
- Help patients make sense of their consultation transcripts and summaries.
- Answer follow-up questions about what the doctor said.
- Provide general educational health information.

YOUR TONE:
- Warm, empathetic, and encouraging — patients may feel anxious or overwhelmed.
- Clear and concise — avoid jargon. When you must use a medical term, explain it.
- Honest about uncertainty — if something is complex or ambiguous, say so.

CRITICAL BOUNDARIES (always follow these):
- You are NOT a doctor and do NOT provide diagnoses.
- Never recommend or adjust medications, dosages, or treatments.
- For any urgent or emergency situation, immediately direct the patient to
  contact their healthcare provider or emergency services.
- Remind patients when appropriate that their doctor is their primary source
  of medical guidance.
- Never store, share, or reference any patient data beyond this conversation.

LANGUAGE:
- Reply in the same language the patient uses.
- Be especially sensitive to patients who may have low health literacy.
""".strip()


# ---------------------------------------------------------------------------
# Chat
# ---------------------------------------------------------------------------

def chat(
    messages: list[dict],
    consultation_transcript: Optional[str] = None,
) -> dict:
    """
    Send a conversation turn to Heli and get a response.

    Args:
        messages: Full conversation history in the format:
                  [{"role": "user", "content": "..."}, ...]
                  Always include the entire history — Gemini is stateless.

        consultation_transcript: Optional text from the patient's transcribed
                                  consultation to give Heli context.

    Returns:
        {
            "reply":        str,   # Heli's response text
            "input_tokens": int,   # Tokens used in the request
            "output_tokens": int,  # Tokens used in the response
        }
    """
    model = _get_model()

    # Build full history, injecting the transcript context if provided
    history = _build_history(messages, consultation_transcript)

    # Gemini's SDK separates history from the final message.
    # The last message must always be from the user.
    gemini_history = history[:-1]   # Everything except the last user message
    last_user_message = history[-1]["parts"]

    chat_session = model.start_chat(history=gemini_history)
    response = chat_session.send_message(last_user_message)

    return {
        "reply": response.text.strip(),
        "input_tokens": response.usage_metadata.prompt_token_count,
        "output_tokens": response.usage_metadata.candidates_token_count,
    }


def _build_history(
    messages: list[dict],
    consultation_transcript: Optional[str],
) -> list[dict]:
    """
    Convert our internal message format to Gemini's expected format.

    Gemini uses:
      - role: "user" or "model"  (not "assistant")
      - parts: the message text

    If a consultation transcript is provided, it's injected as the very
    first user/model exchange so Heli has full context from the start.
    """
    history = []

    # Inject transcript context as the opening exchange
    if consultation_transcript:
        history.append({
            "role": "user",
            "parts": (
                "I'm going to share the transcript of my recent medical "
                "consultation so you have context for my questions.\n\n"
                f"{consultation_transcript}"
            ),
        })
        history.append({
            "role": "model",
            "parts": (
                "Thank you for sharing your consultation transcript. "
                "I've read through it and I'm ready to help you understand "
                "anything that was discussed. What would you like to know?"
            ),
        })

    # Convert the rest of the conversation
    for msg in messages:
        role = "model" if msg["role"] == "assistant" else "user"
        history.append({"role": role, "parts": msg["content"]})

    return history