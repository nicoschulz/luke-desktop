import { Message } from '../anthropic/types';

export interface ChatSession {
  id: string;
  title: string;
  projectId?: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

export interface ChatStore {
  sessions: Record<string, ChatSession>;
  currentSessionId: string | null;
}

export interface CreateSessionOptions {
  title?: string;
  projectId?: string;
  messages?: Message[];
}

export type ChatEvent = 
  | { type: 'session_created'; session: ChatSession }
  | { type: 'session_updated'; session: ChatSession }
  | { type: 'session_deleted'; sessionId: string }
  | { type: 'message_added'; sessionId: string; message: Message }
  | { type: 'messages_cleared'; sessionId: string };