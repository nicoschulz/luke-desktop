import { Message } from '@anthropic-ai/sdk';

export interface ClaudeConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  organization?: string;
  maxRetries?: number;
  retryDelay?: number;
}

export interface ClaudeMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: number;
  metadata?: Record<string, unknown>;
  attachments?: ClaudeAttachment[];
}

export interface ClaudeAttachment {
  id: string;
  type: string;
  name: string;
  content: string | ArrayBuffer;
  metadata?: Record<string, unknown>;
}

export interface ClaudeCompletion {
  id: string;
  model: string;
  response: string;
  created_at: number;
  stop_reason: string | null;
  stop_sequence: string | null;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ClaudeError extends Error {
  status?: number;
  code?: string;
  param?: string;
}

export type ClaudeStreamCallbacks = {
  onChunk?: (chunk: string) => void;
  onError?: (error: ClaudeError) => void;
  onComplete?: (completion: ClaudeCompletion) => void;
};

export interface ClaudeRequestOptions {
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
  stream?: boolean;
  systemPrompt?: string;
  maxRetries?: number;
  retryDelay?: number;
}