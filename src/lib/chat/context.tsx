import { createContext, useContext, useState, useEffect } from 'react';
import type { ChatSession } from './types';

interface ChatContextType {
  store: ChatSession | null;
  setStore: (store: ChatSession | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<ChatSession | null>(null);

  useEffect(() => {
    // Initialize store
    const initStore = async () => {
      const newStore: ChatSession = {
        id: 'default',
        title: 'Default Chat',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: []
      };
      setStore(newStore);
    };
    initStore();
  }, []);

  useEffect(() => {
    // Save store when it changes
    if (store) {
      console.log('Store updated:', store);
    }
  }, [store]);

  return (
    <ChatContext.Provider value={{ store, setStore }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}