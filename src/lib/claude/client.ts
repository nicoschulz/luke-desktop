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
  private config: ClaudeConfig;

  constructor(config: ClaudeConfig) {
    this.config = config;

    this.client = new Anthropic({
      apiKey: config.apiKey,
    });
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (maxRetries <= 0) {
        throw error;
      }

      const delay = baseDelay * 2;
      console.warn(`Retry attempt after ${delay}ms`);
      await this.delay(delay);
      
      return this.retryWithBackoff(operation, maxRetries - 1, delay);
    }
  }

  private formatMessages(messages: ClaudeMessage[]): { role: 'user' | 'assistant'; content: string }[] {
    return messages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));
  }

  async sendMessage(
    messages: ClaudeMessage[],
    options: ClaudeRequestOptions = {}
  ): Promise<ClaudeCompletion> {
    const {
      temperature = 0.7,
      maxTokens = 4096,
      stopSequences,
      systemPrompt,
    } = options;

    const formattedMessages = this.formatMessages(messages);
    
    // Add system prompt as first message if provided
    const allMessages = systemPrompt 
      ? [{ role: 'user' as const, content: systemPrompt }, ...formattedMessages]
      : formattedMessages;

    try {
      const response = await this.retryWithBackoff(
        async () => {
          const completion = await this.client.messages.create({
            model: this.config.model,
            messages: allMessages,
            max_tokens: maxTokens,
            temperature,
            stop_sequences: stopSequences,
          });

          return {
            id: completion.id,
            model: completion.model,
            response: completion.content[0]?.type === 'text' ? completion.content[0].text : '',
            created_at: Date.now(),
            stop_reason: completion.stop_reason || null,
            stop_sequence: completion.stop_sequence || null,
            usage: {
              input_tokens: completion.usage.input_tokens,
              output_tokens: completion.usage.output_tokens,
            },
          };
        }
      );

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
      maxTokens = 4096,
      stopSequences,
      systemPrompt,
    } = options;

    const formattedMessages = this.formatMessages(messages);
    
    // Add system prompt as first message if provided
    const allMessages = systemPrompt 
      ? [{ role: 'user' as const, content: systemPrompt }, ...formattedMessages]
      : formattedMessages;

    try {
      await this.retryWithBackoff(
        async () => {
          const stream = await this.client.messages.create({
            model: this.config.model,
            messages: allMessages,
            max_tokens: maxTokens,
            temperature,
            stop_sequences: stopSequences,
            stream: true,
          });

          let fullContent = '';
          let usage = {
            input_tokens: 0,
            output_tokens: 0,
          };

          for await (const chunk of stream) {
            if (chunk.type === 'message_delta') {
              const content = (chunk.delta as any)?.text || '';
              fullContent += content;
              
              if (callbacks.onMessageDelta) {
                callbacks.onMessageDelta(chunk);
              }
            }
          }

          if (callbacks.onMessageStop) {
            callbacks.onMessageStop({
              id: crypto.randomUUID(),
              model: this.config.model,
              response: fullContent,
              created_at: Date.now(),
              stop_reason: null,
              stop_sequence: null,
              usage,
            });
          }
        }
      );
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