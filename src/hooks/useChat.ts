import { useState, useCallback } from 'react';
import { ChatSession, ChatMessage } from '../types/chat';

// Dummy invoke function
const invoke = async <T>(command: string, args?: any): Promise<T> => {
  console.log(`Dummy invoke: ${command}`, args);
  return {} as T;
};

export function useChat(chatId?: string) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [attachments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async (projectId?: number) => {
    try {
      setLoading(true);
      const result = await invoke<ChatSession[]>('get_chat_sessions', { projectId });
      setSessions(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chat sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  const createSession = useCallback(async (title: string, projectId?: number) => {
    try {
      setLoading(true);
      const session = await invoke<ChatSession>('create_chat_session', { title, projectId });
      setSessions(prev => [session, ...prev]);
      setCurrentSession(session);
      return session;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create chat session');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (sessionId: number) => {
    try {
      setLoading(true);
      const result = await invoke<ChatMessage[]>('get_chat_messages', { sessionId });
      setMessages(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (
    sessionId: number,
    content: string,
    role: 'user' | 'assistant' | 'system',
    metadata?: Record<string, any>
  ) => {
    try {
      setLoading(true);
      const message = await invoke<ChatMessage>('add_chat_message', {
        sessionId,
        content,
        role,
        metadata: metadata ? JSON.stringify(metadata) : null,
      });
      setMessages(prev => [...prev, message]);
      return message;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const archiveSession = useCallback(async (sessionId: number) => {
    try {
      setLoading(true);
      await invoke('archive_chat_session', { sessionId });
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive chat session');
    } finally {
      setLoading(false);
    }
  }, [currentSession]);

  // Dummy implementations for missing methods
  const addMessage = useCallback(async (_content: string, _role: string = 'user') => {
    // Dummy implementation
    return Promise.resolve('dummy-message-id');
  }, []);

  const editMessage = useCallback(async (_messageId: string, _content: string) => {
    // Dummy implementation
    return Promise.resolve();
  }, []);

  const deleteMessage = useCallback(async (_messageId: string) => {
    // Dummy implementation
    return Promise.resolve();
  }, []);

  const addAttachment = useCallback(async (_messageId: string, _file: File) => {
    // Dummy implementation
    return Promise.resolve();
  }, []);

  const addTag = useCallback(async (_tag: string) => {
    // Dummy implementation
    return Promise.resolve();
  }, []);

  const removeTag = useCallback(async (_tag: string) => {
    // Dummy implementation
    return Promise.resolve();
  }, []);

  const updateChat = useCallback(async (_updates: any) => {
    // Dummy implementation
    return Promise.resolve();
  }, []);

  return {
    sessions,
    currentSession,
    messages,
    attachments,
    loading,
    error,
    loadSessions,
    createSession,
    loadMessages,
    sendMessage,
    archiveSession,
    setCurrentSession,
    addMessage,
    editMessage,
    deleteMessage,
    addAttachment,
    addTag,
    removeTag,
    updateChat,
    chat: { id: chatId, title: 'Chat', tags: [] }, // Dummy chat object
  };
}