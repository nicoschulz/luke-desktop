import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import type { Chat, Message, ChatSearchQuery } from '../lib/types/chat';

export function useChatSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{
    chats: Chat[];
    messages: Message[];
  }>({ chats: [], messages: [] });

  const search = useCallback(async (query: ChatSearchQuery) => {
    try {
      setLoading(true);
      setError(null);

      const [chats, messages] = await Promise.all([
        invoke<Chat[]>('search_chats', { query }),
        query.text ? invoke<Message[]>('search_messages', { query: query.text }) : Promise.resolve([])
      ]);

      setResults({ chats, messages });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    search,
    results,
    loading,
    error
  };
}
