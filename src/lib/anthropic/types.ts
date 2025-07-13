export interface AnthropicConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  organization?: string;
  maxRetries?: number;
  retryDelay?: number;
}

export interface ChatRequest {
  messages: Message[];
  model: string;
  maxTokens?: number;
  temperature?: number;
  stopSequences?: string[];
  systemPrompt?: string;
}

export interface ChatResponse {
  id: string;
  model: string;
  content: string;
  created_at: number;
  stop_reason: string | null;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: number;
}

export interface ChatEventCallback {
  onChunk?: (chunk: string) => void;
  onError?: (error: Error) => void;
  onComplete?: (response: ChatResponse) => void;
}

export interface StreamChunk {
  type: string;
  data?: any;
  error?: string;
}

export interface AnthropicError extends Error {
  code?: string;
  status?: number;
  details?: any;
}