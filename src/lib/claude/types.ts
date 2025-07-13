export interface ClaudeConfig {
  apiKey: string;
  model: string;
  organization?: string;
}

export interface ClaudeMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: number;
  attachments?: any[];
}

export interface ClaudeCompletion {
  id: string;
  model: string;
  response: string;
  created_at: number;
  stop_reason: string | null;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface ClaudeStreamCallbacks {
  onMessageStart?: (data: any) => void;
  onMessageDelta?: (data: any) => void;
  onMessageStop?: (data: any) => void;
  onContentBlockStart?: (data: any) => void;
  onContentBlockDelta?: (data: any) => void;
  onContentBlockStop?: (data: any) => void;
  onError?: (error: any) => void;
}

export interface ClaudeError extends Error {
  status?: number;
  code?: string;
  param?: string;
}

export interface ClaudeRequestOptions {
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
  stream?: boolean;
  systemPrompt?: string;
  maxRetries?: number;
  retryDelay?: number;
}