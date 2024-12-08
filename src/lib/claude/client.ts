import Anthropic from '@anthropic-ai/sdk';
import {
  ClaudeConfig,
  ClaudeMessage,
  ClaudeCompletion,
  ClaudeError,
  ClaudeStreamCallbacks,
  ClaudeRequestOptions,
} from './types';

export class ClaudeClient {
  private client: Anthropic;
  private config: Required<ClaudeConfig>;
  private retryCount: number = 0;

  constructor(config: ClaudeConfig) {
    this.config = {
      baseUrl: 'https://api.anthropic.com/v1',
      model: 'claude-3-opus-20240229',
      organization: undefined,
      maxRetries: 3,
      retryDelay: 1000,
      ...config,
    };

    this.client = new Anthropic({
      apiKey: config.apiKey,
      baseURL: this.config.baseUrl,
    });
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.config.maxRetries,
    baseDelay: number = this.config.retryDelay
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (this.retryCount >= maxRetries) {
        this.retryCount = 0;
        throw error;
      }

      const delay = baseDelay * Math.pow(2, this.retryCount);
      this.retryCount++;
      
      console.warn(`Retry attempt ${this.retryCount}/${maxRetries} after ${delay}ms`);
      await this.delay(delay);
      
      return this.retryWithBackoff(operation, maxRetries, baseDelay);
    }
  }

  private formatMessages(messages: ClaudeMessage[]): { role: string; content: string }[] {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  async sendMessage(
    messages: ClaudeMessage[],
    options: ClaudeRequestOptions = {}
  ): Promise<ClaudeCompletion> {
    const {
      temperature = 0.7,
      maxTokens,
      stopSequences,
      systemPrompt,
      maxRetries = this.config.maxRetries,
    } = options;

    const formattedMessages = this.formatMessages(messages);
    
    if (systemPrompt) {
      formattedMessages.unshift({ role: 'system', content: systemPrompt });
    }

    try {
      const response = await this.retryWithBackoff(
        async () => {
          const completion = await this.client.messages.create({
            model: this.config.model,
            messages: formattedMessages,
            max_tokens: maxTokens,
            temperature,
            stop_sequences: stopSequences,
          });

          return {
            id: completion.id,
            model: completion.model,
            response: completion.content,
            created_at: Date.parse(completion.created_at),
            stop_reason: completion.stop_reason || null,
            stop_sequence: completion.stop_sequence || null,
            usage: {
              prompt_tokens: completion.usage.input_tokens,
              completion_tokens: completion.usage.output_tokens,
              total_tokens: completion.usage.input_tokens + completion.usage.output_tokens,
            },
          };
        },
        maxRetries
      );

      this.retryCount = 0;
      return response;
    } catch (error) {
      const claudeError = error as ClaudeError;
      if (error instanceof Error) {
        claudeError.message = error.message;
      }
      throw claudeError;
    }
  }

  async streamMessage(
    messages: ClaudeMessage[],
    callbacks: ClaudeStreamCallbacks,
    options: ClaudeRequestOptions = {}
  ): Promise<void> {
    const {
      temperature = 0.7,
      maxTokens,
      stopSequences,
      systemPrompt,
      maxRetries = this.config.maxRetries,
    } = options;

    const formattedMessages = this.formatMessages(messages);
    
    if (systemPrompt) {
      formattedMessages.unshift({ role: 'system', content: systemPrompt });
    }

    try {
      await this.retryWithBackoff(
        async () => {
          const stream = await this.client.messages.create({
            model: this.config.model,
            messages: formattedMessages,
            max_tokens: maxTokens,
            temperature,
            stop_sequences: stopSequences,
            stream: true,
          });

          let fullContent = '';
          let usage = {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0,
          };

          for await (const chunk of stream) {
            if (chunk.type === 'message_delta') {
              const content = chunk.delta?.text || '';
              fullContent += content;
              
              if (callbacks.onChunk) {
                callbacks.onChunk(content);
              }
            }

            if (chunk.type === 'message_delta.usage') {
              usage = {
                prompt_tokens: chunk.usage.input_tokens,
                completion_tokens: chunk.usage.output_tokens,
                total_tokens: chunk.usage.input_tokens + chunk.usage.output_tokens,
              };
            }
          }

          if (callbacks.onComplete) {
            callbacks.onComplete({
              id: crypto.randomUUID(),
              model: this.config.model,
              response: fullContent,
              created_at: Date.now(),
              stop_reason: null,
              stop_sequence: null,
              usage,
            });
          }
        },
        maxRetries
      );

      this.retryCount = 0;
    } catch (error) {
      const claudeError = error as ClaudeError;
      if (error instanceof Error) {
        claudeError.message = error.message;
      }
      
      if (callbacks.onError) {
        callbacks.onError(claudeError);
      }
      throw claudeError;
    }
  }
}