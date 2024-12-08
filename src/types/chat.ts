export interface ChatSession {
  id: number | null;
  title: string;
  created_at: string;
  updated_at: string;
  project_id: number | null;
  is_archived: boolean;
}

export interface ChatMessage {
  id: number | null;
  session_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  metadata?: string;
}

export interface ChatState {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
}