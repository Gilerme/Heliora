/**
 * heliora — Backend API Service
 * --------------------------------
 * This file is the single point of contact between the Expo frontend
 * and the FastAPI Python backend (running in back_tables/).
 *
 * Place this file at: src/services/helioraApi.ts
 *
 * Usage:
 *   import { transcribeAudio, chatWithHeli } from '@/src/services/helioraApi';
 */

import * as FileSystem from 'expo-file-system';

// ---------------------------------------------------------------------------
// Config — change this to your server's address when deploying
// ---------------------------------------------------------------------------

const BASE_URL = __DEV__
  ? 'http://localhost:8000'   // Local development
  : 'https://your-production-url.com'; // Replace when deploying


// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TranscriptSegment {
  id: number;
  start: number;   // seconds
  end: number;     // seconds
  text: string;
}

export interface TranscriptionResult {
  transcript: string;
  language: string;
  duration_seconds: number;
  segments: TranscriptSegment[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResult {
  reply: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}


// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}


// ---------------------------------------------------------------------------
// Feature 1 — Transcription
// -------------------------
// Sends a local audio file URI to the backend and returns the transcript.
// Works with any audio file picked via expo-document-picker or recorded
// via expo-av.
// ---------------------------------------------------------------------------

export async function transcribeAudio(
  audioUri: string,
  language?: string,   // e.g. 'pt' for Portuguese, 'en' for English
): Promise<TranscriptionResult> {

  // expo-file-system gives us the real file path; fetch FormData needs it
  const fileInfo = await FileSystem.getInfoAsync(audioUri);
  if (!fileInfo.exists) {
    throw new Error('Audio file not found at: ' + audioUri);
  }

  // Determine MIME type from extension
  const extension = audioUri.split('.').pop()?.toLowerCase() ?? 'mp3';
  const mimeTypes: Record<string, string> = {
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    m4a: 'audio/m4a',
    ogg: 'audio/ogg',
    webm: 'audio/webm',
    caf: 'audio/x-caf',   // iOS recording format
  };
  const mimeType = mimeTypes[extension] ?? 'audio/mpeg';

  // Build FormData — React Native's fetch supports this natively
  const formData = new FormData();
  formData.append('file', {
    uri: audioUri,
    name: `consultation.${extension}`,
    type: mimeType,
  } as any);

  if (language) {
    formData.append('language', language);
  }

  const response = await fetch(`${BASE_URL}/transcribe`, {
    method: 'POST',
    body: formData as any,
    // Do NOT set Content-Type header — fetch sets it automatically
    // with the correct multipart boundary when using FormData
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}) as { detail?: string });
    throw new Error((error as { detail?: string })?.detail ?? `Transcription failed (${response.status})`);
  }

  return response.json() as Promise<TranscriptionResult>;
}


// ---------------------------------------------------------------------------
// Feature 2 — Chatbot (Heli)
// ---------------------------
// Sends the full conversation history to Heli.
// Always pass ALL messages from the start — Heli has no memory between calls.
//
// Optionally pass the consultation transcript so Heli can answer questions
// specifically about what was said during the consultation.
// ---------------------------------------------------------------------------

export async function chatWithHeli(
  messages: ChatMessage[],
  consultationTranscript?: string,
): Promise<ChatResult> {

  const response = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      consultation_transcript: consultationTranscript ?? null,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}) as { detail?: string });
    throw new Error((error as { detail?: string })?.detail ?? `Chat failed (${response.status})`);
  }

  return response.json() as Promise<ChatResult>;
}