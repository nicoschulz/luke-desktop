import { useState, useCallback } from 'react';
import type { Chat, Message, ChatSearchQuery } from '../lib/types/chat';

export function useChatSearch() {
  const [results, setResults] = useState<{ chats: Chat[]; messages: Message[] }>({
    chats: [],
    messages: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: ChatSearchQuery) => {
    setLoading(true);
    setError(null);

    try {
      const [chats, messages] = await Promise.all([
        // invoke<Chat[]>('search_chats', { query }),
        Promise.resolve([] as Chat[]),
        // query.text ? invoke<Message[]>('search_messages', { query: query.text }) : Promise.resolve([])
        query.text ? Promise.resolve([] as Message[]) : Promise.resolve([] as Message[])
      ]);

      setResults({ chats, messages });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    results,
    loading,
    error,
    search
  };
}
