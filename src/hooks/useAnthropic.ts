import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { AnthropicClient } from '../lib/anthropic/client';
import type { ChatRequest, ChatResponse, ChatEventCallback } from '../lib/anthropic/types';

interface UseAnthropicOptions {
  onError?: (error: Error) => void;
}

export function useAnthropic(options: UseAnthropicOptions = {}) {
  const [client, setClient] = useState<AnthropicClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      const apiKey = await invoke<string>('get_api_key');
      if (apiKey) {
        setClient(new AnthropicClient({ apiKey }));
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      options.onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  const setApiKey = useCallback(async (apiKey: string) => {
    try {
      await invoke('set_api_key', { apiKey });
      setClient(new AnthropicClient({ apiKey }));
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      options.onError?.(error);
      throw error;
    }
  }, [options.onError]);

  const chat = useCallback(async (request: ChatRequest): Promise<ChatResponse> => {
    if (!client) {
      throw new Error('Anthropic client not initialized');
    }
    return client.chat(request);
  }, [client]);

  const streamChat = useCallback(
    async (
      request: ChatRequest,
      onEvent: ChatEventCallback,
      onError?: (error: Error) => void
    ): Promise<void> => {
      if (!client) {
        throw new Error('Anthropic client not initialized');
      }
      return client.streamChat(request, onEvent, onError);
    },
    [client]
  );

  const abort = useCallback(() => {
    client?.abort();
  }, [client]);

  return {
    client,
    isLoading,
    error,
    setApiKey,
    chat,
    streamChat,
    abort,
  };
}