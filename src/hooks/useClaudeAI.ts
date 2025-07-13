import { useState, useCallback } from 'react';
import { ClaudeClient } from '../lib/claude/client';
import { ClaudeConfig, ClaudeMessage, ClaudeRequestOptions, ClaudeStreamCallbacks } from '../lib/claude/types';

export interface UseClaudeAIReturn {
  client: ClaudeClient | null;
  loading: boolean;
  error: string | null;
  sendMessage: (content: string, options?: ClaudeRequestOptions) => Promise<string>;
  streamMessage: (
    content: string,
    callbacks: ClaudeStreamCallbacks,
    options?: ClaudeRequestOptions
  ) => Promise<void>;
}

export function useClaudeAI(config: ClaudeConfig): UseClaudeAIReturn {
  const [client, setClient] = useState<ClaudeClient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize client
  if (!client) {
    setClient(new ClaudeClient(config));
  }

  const sendMessage = useCallback(
    async (content: string, options: ClaudeRequestOptions = {}): Promise<string> => {
      if (!client) {
        throw new Error('Claude client not initialized');
      }

      setLoading(true);
      setError(null);

      try {
        const messages: ClaudeMessage[] = [
          {
            id: Date.now().toString(),
            role: 'user',
            content,
            created_at: Date.now(),
          },
        ];

        const response = await client.sendMessage(messages, options);
        return response.response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const streamMessage = useCallback(
    async (
      content: string,
      callbacks: ClaudeStreamCallbacks,
      options: ClaudeRequestOptions = {}
    ): Promise<void> => {
      if (!client) {
        throw new Error('Claude client not initialized');
      }

      setLoading(true);
      setError(null);

      try {
        const messages: ClaudeMessage[] = [
          {
            id: Date.now().toString(),
            role: 'user',
            content,
            created_at: Date.now(),
          },
        ];

        await client.streamMessage(messages, callbacks, options);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to stream message';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  return {
    client,
    loading,
    error,
    sendMessage,
    streamMessage,
  };
}