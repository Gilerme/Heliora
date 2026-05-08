/**
 * heliora — Transcription Screen (with in-app recording)
 * ---------------------------------------------------------
 * Patients can:
 *   1. Record audio directly inside the app (via expo-av)
 *   2. OR upload an existing audio file from their device
 *
 * After capturing audio either way, it's sent to the FastAPI backend
 * (back_tables/) where Whisper transcribes it locally and privately.
 * The patient then gets an editable transcript they can save.
 *
 * Place this file at: app/(tabs)/transcription.tsx
 *
 * Before using, install expo-av:
 *   npx expo install expo-av
 *
 * Then add to app.json plugins array:
 *   "expo-av"
 */

import { transcribeAudio, TranscriptionResult } from '@/src/services/helioraApi';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ---------------------------------------------------------------------------
// Recording state machine
// ---------------------------------------------------------------------------

type RecordingStatus = 'idle' | 'recording' | 'stopped';

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function TranscriptionScreen() {

  // Recording
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pulse animation on the record button
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Transcription
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [editableText, setEditableText] = useState('');
  const [sourceLabel, setSourceLabel] = useState<string | null>(null);

  // ---- Cleanup on unmount ---------------------------------------------------
  useEffect(() => {
    return () => {
      stopTimer();
      if (recording) recording.stopAndUnloadAsync();
    };
  }, [recording]);

  // ---- Pulse animation while recording -------------------------------------
  useEffect(() => {
    if (recordingStatus === 'recording') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [recordingStatus]);

  // ---- Timer ---------------------------------------------------------------
  const startTimer = () => {
    setElapsedSeconds(0);
    timerRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ---- Start recording -----------------------------------------------------
  const startRecording = async () => {
    try {
      // Request microphone permission
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permissão necessária',
          'O heliora precisa de acesso ao microfone para gravar a consulta.',
        );
        return;
      }

      // Configure audio session
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create and start recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      setRecording(newRecording);
      setRecordingStatus('recording');
      setResult(null);
      setEditableText('');
      setSourceLabel(null);
      setRecordingUri(null);
      startTimer();

    } catch (err) {
      Alert.alert('Erro', 'Não foi possível iniciar a gravação.');
      console.error(err);
    }
  };

  // ---- Stop recording ------------------------------------------------------
  const stopRecording = async () => {
    if (!recording) return;

    stopTimer();
    setRecordingStatus('stopped');

    try {
      await recording.stopAndUnloadAsync();

      // Reset audio session so other apps can use the speaker
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      const uri = recording.getURI();
      setRecording(null);

      if (!uri) throw new Error('Gravação sem URI.');

      setRecordingUri(uri);
      setSourceLabel(`Gravação • ${formatTime(elapsedSeconds)}`);
      await runTranscription(uri);

    } catch (err: any) {
      Alert.alert('Erro', err.message ?? 'Erro ao finalizar gravação.');
      setRecordingStatus('idle');
    }
  };

  // ---- Pick audio file from device -----------------------------------------
  const pickAudio = async () => {
    if (recordingStatus === 'recording') {
      Alert.alert('Atenção', 'Pare a gravação antes de selecionar um arquivo.');
      return;
    }

    try {
      const picked = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true,
      });

      if (picked.canceled || !picked.assets?.length) return;

      const file = picked.assets[0];
      setSourceLabel(`Arquivo: ${file.name}`);
      setResult(null);
      setEditableText('');
      setRecordingStatus('idle');
      await runTranscription(file.uri);

    } catch (err) {
      Alert.alert('Erro', 'Não foi possível selecionar o arquivo.');
      console.error(err);
    }
  };

  // ---- Send audio to backend for transcription -----------------------------
  const runTranscription = async (uri: string) => {
    setIsTranscribing(true);
    try {
      const data = await transcribeAudio(uri, 'pt');
      setResult(data);
      setEditableText(data.transcript);
    } catch (err: any) {
      Alert.alert('Erro na transcrição', err.message ?? 'Tente novamente.');
    } finally {
      setIsTranscribing(false);
    }
  };

  // ---- Save transcript (connect to your own storage) -----------------------
  const saveTranscript = () => {
    // TODO: connect to AsyncStorage / Supabase / your database
    Alert.alert('Salvo!', 'Sua transcrição foi salva com sucesso.');
  };

  // ---- Re-transcribe current recording ------------------------------------
  const retranscribe = async () => {
    if (!recordingUri) return;
    setResult(null);
    setEditableText('');
    await runTranscription(recordingUri);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <Text style={styles.title}>Transcrição da Consulta</Text>
      <Text style={styles.subtitle}>
        Grave a consulta ao vivo ou envie um áudio existente para receber um resumo editável.
      </Text>

      {/* ── Recorder ─────────────────────────────────────────── */}
      <View style={styles.recorderCard}>

        {/* Timer */}
        <Text style={[
          styles.timer,
          recordingStatus === 'recording' && styles.timerActive,
        ]}>
          {formatTime(elapsedSeconds)}
        </Text>

        {/* Status label */}
        <Text style={styles.statusLabel}>
          {recordingStatus === 'idle'      && 'Pronto para gravar'}
          {recordingStatus === 'recording' && '● Gravando…'}
          {recordingStatus === 'stopped'   && 'Gravação finalizada'}
        </Text>

        {/* Record / Stop button */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[
              styles.recordButton,
              recordingStatus === 'recording' && styles.recordButtonActive,
            ]}
            onPress={recordingStatus === 'recording' ? stopRecording : startRecording}
            disabled={isTranscribing}
            activeOpacity={0.8}
          >
            {recordingStatus === 'recording' ? (
              <View style={styles.stopIcon} />
            ) : (
              <Text style={styles.recordIcon}>🎙️</Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.recordHint}>
          {recordingStatus === 'recording'
            ? 'Toque para parar e transcrever'
            : 'Toque para iniciar a gravação'}
        </Text>
      </View>

      {/* ── Divider ──────────────────────────────────────────── */}
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>ou</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* ── Upload button ────────────────────────────────────── */}
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={pickAudio}
        disabled={isTranscribing || recordingStatus === 'recording'}
      >
        <Text style={styles.uploadButtonText}>📂 Enviar arquivo de áudio</Text>
      </TouchableOpacity>

      {/* ── Source label ─────────────────────────────────────── */}
      {sourceLabel && (
        <Text style={styles.sourceLabel}>📄 {sourceLabel}</Text>
      )}

      {/* ── Transcribing indicator ───────────────────────────── */}
      {isTranscribing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90D9" />
          <Text style={styles.loadingText}>
            Transcrevendo com Whisper… isso pode levar alguns segundos.
          </Text>
        </View>
      )}

      {/* ── Transcript result ────────────────────────────────── */}
      {result && !isTranscribing && (
        <View style={styles.resultContainer}>

          {/* Meta badges */}
          <View style={styles.metaRow}>
            <Text style={styles.metaBadge}>
              🌐 {result.language.toUpperCase()}
            </Text>
            <Text style={styles.metaBadge}>
              ⏱ {Math.round(result.duration_seconds)}s
            </Text>
          </View>

          {/* Editable transcript */}
          <Text style={styles.sectionLabel}>Transcrição (editável):</Text>
          <TextInput
            style={styles.transcriptInput}
            multiline
            value={editableText}
            onChangeText={setEditableText}
            placeholder="A transcrição aparecerá aqui…"
            textAlignVertical="top"
          />

          {/* Action buttons */}
          <View style={styles.actionRow}>
            {recordingUri && (
              <TouchableOpacity style={styles.retryButton} onPress={retranscribe}>
                <Text style={styles.retryButtonText}>🔄 Refazer</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.saveButton} onPress={saveTranscript}>
              <Text style={styles.saveButtonText}>💾 Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  content: {
    padding: 24,
    paddingBottom: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A2C4E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#5C6B80',
    marginBottom: 28,
    lineHeight: 22,
  },

  // Recorder card
  recorderCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#D0DFF0',
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  timer: {
    fontSize: 40,
    fontWeight: '200',
    color: '#B0C8E8',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  timerActive: {
    color: '#E53935',
  },
  statusLabel: {
    fontSize: 13,
    color: '#5C6B80',
    marginBottom: 8,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A90D9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  recordButtonActive: {
    backgroundColor: '#E53935',
    shadowColor: '#E53935',
  },
  recordIcon: {
    fontSize: 32,
  },
  stopIcon: {
    width: 28,
    height: 28,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  recordHint: {
    fontSize: 12,
    color: '#A0AEC0',
    marginTop: 4,
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D0DFF0',
  },
  dividerText: {
    color: '#A0AEC0',
    fontSize: 13,
  },

  // Upload
  uploadButton: {
    borderWidth: 1.5,
    borderColor: '#4A90D9',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  uploadButtonText: {
    color: '#4A90D9',
    fontSize: 15,
    fontWeight: '600',
  },
  sourceLabel: {
    color: '#5C6B80',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    marginTop: 32,
    gap: 12,
  },
  loadingText: {
    color: '#5C6B80',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Result
  resultContainer: {
    marginTop: 28,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metaBadge: {
    fontSize: 12,
    color: '#4A90D9',
    backgroundColor: '#E8F0FB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontWeight: '500',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A2C4E',
    marginBottom: 8,
  },
  transcriptInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D0DFF0',
    padding: 16,
    fontSize: 15,
    color: '#1A2C4E',
    minHeight: 200,
    lineHeight: 22,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  retryButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#4A90D9',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#4A90D9',
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#2ECC71',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
