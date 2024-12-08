export interface AnthropicConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  maxRetries?: number;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  id?: string;
  timestamp?: number;
}

export interface ChatRequest {
  messages: Message[];
  model?: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  stream?: boolean;
}

export interface ChatResponse {
  id: string;
  model: string;
  role: 'assistant';
  content: string;
  stop_reason: string | null;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface StreamChunk {
  id: string;
  model: string;
  type: 'content_block_start' | 'content_block_delta' | 'content_block_stop';
  index: number;
  delta?: {
    text?: string;
    type?: string;
  };
  content_block?: {
    text?: string;
    type?: string;
  };
}

export type ChatEventCallback = (event: StreamChunk) => void;
export type ErrorCallback = (error: Error) => void;

export interface AnthropicError extends Error {
  status?: number;
  code?: string;
  param?: string;
}