import { useState, useCallback } from 'react';
import { AnthropicClient } from '../lib/anthropic/client';
import { ChatRequest } from '../lib/anthropic/types';

export interface UseAnthropicReturn {
  client: AnthropicClient | null;
  loading: boolean;
  error: string | null;
  sendMessage: (request: ChatRequest) => Promise<string>;
}

export function useAnthropic(apiKey: string): UseAnthropicReturn {
  const [client, setClient] = useState<AnthropicClient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize client
  if (!client) {
    setClient(new AnthropicClient({ apiKey }));
  }

  const sendMessage = useCallback(
    async (request: ChatRequest): Promise<string> => {
      if (!client) {
        throw new Error('Anthropic client not initialized');
      }

      setLoading(true);
      setError(null);

      try {
        const response = await client.chat(request);
        return response.content;
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

  return {
    client,
    loading,
    error,
    sendMessage,
  };
}