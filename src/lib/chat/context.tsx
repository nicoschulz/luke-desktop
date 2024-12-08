import React, { createContext, useContext, useEffect, useState } from 'react';
import { ChatSessionStore } from './store';
import type { ChatSession, ChatEvent } from './types';
import type { Message } from '../anthropic/types';

interface ChatContextValue {
  store: ChatSessionStore;
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  isLoading: boolean;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<ChatSessionStore | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeStore = async () => {
      const newStore = await ChatSessionStore.load();
      setStore(newStore);
      setIsLoading(false);
    };

    initializeStore();
  }, []);

  useEffect(() => {
    if (store) {
      const unsubscribe = store.subscribe(() => {
        store.persist();
      });

      return () => unsubscribe();
    }
  }, [store]);

  if (!store || isLoading) {
    return null; // Or a loading spinner
  }

  const value: ChatContextValue = {
    store,
    currentSession: store.getCurrentSession(),
    sessions: store.getAllSessions(),
    isLoading,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatStore() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatStore must be used within a ChatProvider');
  }

  return {
    store: context.store,
    currentSession: context.currentSession,
    sessions: context.sessions,
    isLoading: context.isLoading,

    createSession: context.store.createSession.bind(context.store),
    updateSession: context.store.updateSession.bind(context.store),
    deleteSession: context.store.deleteSession.bind(context.store),
    setCurrentSession: context.store.setCurrentSession.bind(context.store),
    addMessage: context.store.addMessage.bind(context.store),
    clearMessages: context.store.clearMessages.bind(context.store),
  };
}