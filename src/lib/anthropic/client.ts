import {
  AnthropicConfig,
  ChatRequest,
  ChatResponse,
  ChatEventCallback,
  StreamChunk,
  AnthropicError,
} from './types';

const DEFAULT_BASE_URL = 'https://api.anthropic.com/v1';
const DEFAULT_MODEL = 'claude-3-opus-20240229';
const DEFAULT_MAX_RETRIES = 3;

export class AnthropicClient {
  private config: AnthropicConfig;
  private controller: AbortController | null = null;

  constructor(config: AnthropicConfig) {
    this.config = {
      baseUrl: DEFAULT_BASE_URL,
      model: DEFAULT_MODEL,
      maxRetries: DEFAULT_MAX_RETRIES,
      ...config,
    };
  }

  /**
   * Send a chat completion request
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await this.makeRequest('/messages', {
      method: 'POST',
      body: JSON.stringify({
        model: request.model || this.config.model,
        messages: request.messages,
        max_tokens: request.maxTokens,
        temperature: request.temperature,
        stop_sequences: request.stopSequences,
        system: request.systemPrompt,
      }),
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return await response.json();
  }

  /**
   * Stream a chat completion
   */
  async streamChat(
    request: ChatRequest,
    onEvent: ChatEventCallback,
    onError?: (error: Error) => void
  ): Promise<void> {
    this.controller = new AbortController();

    try {
      const response = await this.makeRequest('/messages', {
        method: 'POST',
        body: JSON.stringify({
          model: request.model || this.config.model,
          messages: request.messages,
          max_tokens: request.maxTokens,
          temperature: request.temperature,
          stop_sequences: request.stopSequences,
          system: request.systemPrompt,
          stream: true,
        }),
        signal: this.controller.signal,
      });

      if (!response.ok) {
        throw await this.handleError(response);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            try {
              const chunk: StreamChunk = JSON.parse(data);
              if (onEvent.onChunk) {
                onEvent.onChunk(JSON.stringify(chunk));
              }
            } catch (error) {
              console.error('Error parsing chunk:', error);
            }
          }
        }
      }
    } catch (error) {
      if (onError && error instanceof Error) {
        onError(error);
      } else {
        throw error;
      }
    } finally {
      this.controller = null;
    }
  }

  /**
   * Abort an ongoing streaming request
   */
  abort(): void {
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }
  }

  private async makeRequest(
    endpoint: string,
    options: RequestInit
  ): Promise<Response> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'X-Api-Key': this.config.apiKey,
      'anthropic-version': '2023-06-01',
    };

    let retries = 0;
    while (true) {
      try {
        return await fetch(url, {
          ...options,
          headers: {
            ...headers,
            ...options.headers,
          },
        });
      } catch (error) {
        if (
          retries >= (this.config.maxRetries || DEFAULT_MAX_RETRIES) ||
          error instanceof TypeError
        ) {
          throw error;
        }
        retries++;
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
      }
    }
  }

  private async handleError(response: Response): Promise<AnthropicError> {
    const error = new Error() as AnthropicError;
    try {
      const data = await response.json();
      error.message = data.error?.message || 'Unknown error';
      error.status = response.status;
      error.code = data.error?.code;
      error.details = data.error;
    } catch {
      error.message = `HTTP error ${response.status}`;
      error.status = response.status;
    }
    return error;
  }
}