export interface Project {
  id: string;
  name: string;
  description?: string;
  created: string;
  updated: string;
  tags?: string[];
  settings: ProjectSettings;
  metadata: ProjectMetadata;
}

export interface ProjectSettings {
  defaultModel?: string;
  temperature?: number;
  maxTokens?: number;
  defaultServer?: string;
  systemPrompt?: string;
}

export interface ProjectMetadata {
  messageCount: number;
  attachmentCount: number;
  totalTokens: number;
  lastMessageDate?: string;
}

export interface ChatMessage {
  id: string;
  projectId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created: string;
  tokens?: number;
  attachments?: Attachment[];
  metadata?: Record<string, unknown>;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  path: string;
  created: string;
  metadata?: Record<string, unknown>;
}

export type ProjectError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}