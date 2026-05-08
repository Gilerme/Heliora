/**
 * heliora — Heli Chat Screen
 * ----------------------------
 * Conversational interface for Heli, heliora's medical assistant.
 * Patients can ask questions in plain language and get clear explanations.
 *
 * Place this file at: app/(tabs)/heli.tsx
 *
 * Optional: pass a `consultationTranscript` prop (from the Transcription screen)
 * so Heli can answer questions about the specific consultation.
 */

import { ChatMessage, chatWithHeli } from '@/src/services/helioraApi';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UIMessage extends ChatMessage {
  id: string;
  isLoading?: boolean;
}

// ---------------------------------------------------------------------------
// Props — pass consultationTranscript from the Transcription screen if available
// ---------------------------------------------------------------------------

interface HeliChatScreenProps {
  consultationTranscript?: string;
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function HeliChatScreen({
  consultationTranscript,
}: HeliChatScreenProps) {

  const [messages, setMessages] = useState<UIMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: consultationTranscript
        ? 'Olá! Já li a transcrição da sua consulta. O que você gostaria de entender melhor? 😊'
        : 'Olá! Sou a Heli, sua assistente de saúde. Pode me perguntar sobre qualquer termo médico ou dúvida da sua consulta. 😊',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  // ---- Send message ----------------------------------------------------------
  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;

    // Add user message to UI immediately
    const userMessage: UIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };

    const loadingMessage: UIMessage = {
      id: 'loading',
      role: 'assistant',
      content: '',
      isLoading: true,
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInputText('');
    scrollToBottom();

    // Build history to send (exclude the welcome & loading messages)
    const history: ChatMessage[] = [...messages, userMessage]
      .filter(m => m.id !== 'welcome' && !m.isLoading)
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const result = await chatWithHeli(history, consultationTranscript);

      const heliReply: UIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.reply,
      };

      // Replace loading bubble with real response
      setMessages(prev => [
        ...prev.filter(m => m.id !== 'loading'),
        heliReply,
      ]);
      scrollToBottom();

    } catch (err: any) {
      setMessages(prev => prev.filter(m => m.id !== 'loading'));
      Alert.alert('Erro', err.message ?? 'Não foi possível obter resposta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }

    setIsLoading(true); // set after adding loading bubble
  };

  const scrollToBottom = () => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  // ---- Render each message bubble -------------------------------------------
  const renderMessage = ({ item }: { item: UIMessage }) => {
    const isUser = item.role === 'user';

    return (
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.heliBubble]}>
        {item.isLoading ? (
          <ActivityIndicator size="small" color="#4A90D9" />
        ) : (
          <>
            {!isUser && (
              <Text style={styles.heliLabel}>Heli</Text>
            )}
            <Text style={[styles.bubbleText, isUser ? styles.userText : styles.heliText]}>
              {item.content}
            </Text>
          </>
        )}
      </View>
    );
  };

  // ---------------------------------------------------------------------------
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Chat context badge */}
      {consultationTranscript && (
        <View style={styles.contextBadge}>
          <Text style={styles.contextBadgeText}>
            📋 Heli tem acesso à sua transcrição
          </Text>
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={scrollToBottom}
      />

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Pergunte à Heli…"
          placeholderTextColor="#A0AEC0"
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          <Text style={styles.sendButtonText}>↑</Text>
        </TouchableOpacity>
      </View>

      {/* Disclaimer */}
      <Text style={styles.disclaimer}>
        A Heli fornece informações educativas, não diagnósticos médicos.
      </Text>
    </KeyboardAvoidingView>
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
  contextBadge: {
    backgroundColor: '#E8F0FB',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D0DFF0',
  },
  contextBadgeText: {
    fontSize: 12,
    color: '#4A90D9',
    fontWeight: '500',
    textAlign: 'center',
  },
  messageList: {
    padding: 16,
    paddingBottom: 8,
    gap: 12,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    backgroundColor: '#4A90D9',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  heliBubble: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#D0DFF0',
  },
  heliLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4A90D9',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  heliText: {
    color: '#1A2C4E',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#D0DFF0',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F9FF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D0DFF0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1A2C4E',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#4A90D9',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#B0C8E8',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  disclaimer: {
    fontSize: 11,
    color: '#A0AEC0',
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
});
