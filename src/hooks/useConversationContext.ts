import { useState, useCallback, useEffect } from 'react';
import { ContextManager, ConversationContext } from '../lib/claude/context';
import { ClaudeMessage } from '../lib/claude/types';

export interface UseConversationContextReturn {
  currentContext: ConversationContext | null;
  contexts: ConversationContext[];
  messages: ClaudeMessage[];
  createContext: (name: string, systemPrompt?: string) => ConversationContext;
  switchContext: (contextId: string) => void;
  updateContext: (updates: Partial<ConversationContext>) => void;
  deleteContext: (contextId: string) => void;
  addMessage: (message: ClaudeMessage) => void;
  clearMessages: () => void;
  exportContext: () => { context: ConversationContext; messages: ClaudeMessage[] };
  importContext: (data: { context: ConversationContext; messages: ClaudeMessage[] }) => void;
}

export function useConversationContext(): UseConversationContextReturn {
  const [contextManager] = useState(() => new ContextManager());
  const [currentContextId, setCurrentContextId] = useState<string | null>(null);
  const [contexts, setContexts] = useState<ConversationContext[]>([]);
  const [messages, setMessages] = useState<ClaudeMessage[]>([]);

  const updateContextsList = useCallback(() => {
    const contextsList: ConversationContext[] = [];
    contextManager.contexts.forEach(context => contextsList.push(context));
    setContexts(contextsList);
  }, [contextManager]);

  const updateMessages = useCallback(() => {
    if (currentContextId) {
      setMessages(contextManager.getMessages(currentContextId));
    } else {
      setMessages([]);
    }
  }, [currentContextId, contextManager]);

  useEffect(() => {
    updateMessages();
  }, [currentContextId, updateMessages]);

  const createContext = useCallback((name: string, systemPrompt?: string) => {
    const context = contextManager.createContext(name, systemPrompt);
    updateContextsList();
    return context;
  }, [contextManager, updateContextsList]);

  const switchContext = useCallback((contextId: string) => {
    const context = contextManager.getContext(contextId);
    if (!context) throw new Error(`Context ${contextId} not found`);
    setCurrentContextId(contextId);
  }, [contextManager]);

  const updateContext = useCallback((updates: Partial<ConversationContext>) => {
    if (!currentContextId) throw new Error('No active context');
    contextManager.updateContext(currentContextId, updates);
    updateContextsList();
  }, [currentContextId, contextManager, updateContextsList]);

  const deleteContext = useCallback((contextId: string) => {
    contextManager.deleteContext(contextId);
    if (currentContextId === contextId) {
      setCurrentContextId(null);
    }
    updateContextsList();
  }, [currentContextId, contextManager, updateContextsList]);

  const addMessage = useCallback((message: ClaudeMessage) => {
    if (!currentContextId) throw new Error('No active context');
    contextManager.addMessage(currentContextId, message);
    updateMessages();
  }, [currentContextId, contextManager, updateMessages]);

  const clearMessages = useCallback(() => {
    if (!currentContextId) throw new Error('No active context');
    contextManager.clearMessages(currentContextId);
    updateMessages();
  }, [currentContextId, contextManager, updateMessages]);

  const exportContext = useCallback(() => {
    if (!currentContextId) throw new Error('No active context');
    return contextManager.exportContext(currentContextId);
  }, [currentContextId, contextManager]);

  const importContext = useCallback((data: {
    context: ConversationContext;
    messages: ClaudeMessage[];
  }) => {
    contextManager.importContext(data);
    updateContextsList();
  }, [contextManager, updateContextsList]);

  return {
    currentContext: currentContextId ? contextManager.getContext(currentContextId) || null : null,
    contexts,
    messages,
    createContext,
    switchContext,
    updateContext,
    deleteContext,
    addMessage,
    clearMessages,
    exportContext,
    importContext,
  };
}