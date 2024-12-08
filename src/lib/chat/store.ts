import { v4 as uuidv4 } from 'uuid';
import { Message } from '../anthropic/types';
import { ChatSession, ChatStore, CreateSessionOptions, ChatEvent } from './types';

export class ChatSessionStore {
  private store: ChatStore;
  private listeners: ((event: ChatEvent) => void)[] = [];

  constructor(initialStore?: Partial<ChatStore>) {
    this.store = {
      sessions: {},
      currentSessionId: null,
      ...initialStore,
    };
  }

  subscribe(listener: (event: ChatEvent) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private emit(event: ChatEvent) {
    this.listeners.forEach(listener => listener(event));
  }

  getCurrentSession(): ChatSession | null {
    return this.store.currentSessionId
      ? this.store.sessions[this.store.currentSessionId]
      : null;
  }

  getAllSessions(): ChatSession[] {
    return Object.values(this.store.sessions).sort(
      (a, b) => b.updatedAt - a.updatedAt
    );
  }

  getSession(sessionId: string): ChatSession | null {
    return this.store.sessions[sessionId] || null;
  }

  createSession(options: CreateSessionOptions = {}): ChatSession {
    const session: ChatSession = {
      id: uuidv4(),
      title: options.title || 'New Chat',
      projectId: options.projectId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: options.messages || [],
    };

    this.store.sessions[session.id] = session;
    this.store.currentSessionId = session.id;

    this.emit({ type: 'session_created', session });
    return session;
  }

  updateSession(
    sessionId: string,
    updates: Partial<Omit<ChatSession, 'id'>>
  ): ChatSession {
    const session = this.store.sessions[sessionId];
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const updatedSession = {
      ...session,
      ...updates,
      updatedAt: Date.now(),
    };

    this.store.sessions[sessionId] = updatedSession;
    this.emit({ type: 'session_updated', session: updatedSession });
    return updatedSession;
  }

  deleteSession(sessionId: string) {
    if (!this.store.sessions[sessionId]) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    delete this.store.sessions[sessionId];

    if (this.store.currentSessionId === sessionId) {
      const sessions = this.getAllSessions();
      this.store.currentSessionId = sessions.length > 0 ? sessions[0].id : null;
    }

    this.emit({ type: 'session_deleted', sessionId });
  }

  setCurrentSession(sessionId: string) {
    if (!this.store.sessions[sessionId]) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    this.store.currentSessionId = sessionId;
  }

  addMessage(sessionId: string, message: Message) {
    const session = this.store.sessions[sessionId];
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const updatedSession = {
      ...session,
      messages: [...session.messages, { ...message, id: uuidv4() }],
      updatedAt: Date.now(),
    };

    this.store.sessions[sessionId] = updatedSession;
    this.emit({ 
      type: 'message_added', 
      sessionId, 
      message: updatedSession.messages[updatedSession.messages.length - 1] 
    });
  }

  clearMessages(sessionId: string) {
    const session = this.store.sessions[sessionId];
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const updatedSession = {
      ...session,
      messages: [],
      updatedAt: Date.now(),
    };

    this.store.sessions[sessionId] = updatedSession;
    this.emit({ type: 'messages_cleared', sessionId });
  }

  async persist(): Promise<void> {
    try {
      const serialized = JSON.stringify(this.store);
      await window.localStorage.setItem('chat-sessions', serialized);
    } catch (error) {
      console.error('Failed to persist chat sessions:', error);
    }
  }

  static async load(): Promise<ChatSessionStore> {
    try {
      const serialized = await window.localStorage.getItem('chat-sessions');
      if (serialized) {
        const store = JSON.parse(serialized);
        return new ChatSessionStore(store);
      }
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
    }
    return new ChatSessionStore();
  }
}