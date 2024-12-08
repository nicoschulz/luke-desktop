import { useState, useCallback, useRef } from 'react';
import { ClaudeClient } from '../lib/claude/client';
import { ClaudeMessage, ClaudeCompletion } from '../lib/claude/types';

export interface UseClaudeAIOptions {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  organization?: string;
}

export interface UseClaudeAIReturn {
  sendMessage: (content: string) => Promise<ClaudeCompletion>;
  streamMessage: (content: string, onChunk: (chunk: string) => void) => Promise<void>;
  messages: ClaudeMessage[];
  isLoading: boolean;
  error: Error | null;
}

export function useClaudeAI({
  apiKey,
  baseUrl,
  model,
  organization,
}: UseClaudeAIOptions): UseClaudeAIReturn {
  const [messages, setMessages] = useState<ClaudeMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const clientRef = useRef<ClaudeClient>();
  
  // Initialize client if not already done
  if (!clientRef.current) {
    clientRef.current = new ClaudeClient({
      apiKey,
      baseUrl,
      model,
      organization,
    });
  }

  const sendMessage = useCallback(async (content: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newMessage: ClaudeMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        created_at: Date.now(),
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      const completion = await clientRef.current!.sendMessage([...messages, newMessage]);
      
      const assistantMessage: ClaudeMessage = {
        id: completion.id,
        role: 'assistant',
        content: completion.response,
        created_at: completion.created_at,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      return completion;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const streamMessage = useCallback(async (content: string, onChunk: (chunk: string) => void) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newMessage: ClaudeMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        created_at: Date.now(),
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      let streamedContent = '';
      await clientRef.current!.streamMessage(
        [...messages, newMessage],
        (chunk) => {
          streamedContent += chunk;
          onChunk(chunk);
        }
      );
      
      const assistantMessage: ClaudeMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: streamedContent,
        created_at: Date.now(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  return {
    sendMessage,
    streamMessage,
    messages,
    isLoading,
    error,
  };
}