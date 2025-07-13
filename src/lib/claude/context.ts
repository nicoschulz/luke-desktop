import { ClaudeMessage } from './types';

export interface ConversationContext {
  id: string;
  name: string;
  systemPrompt?: string;
  metadata: Record<string, any>;
  maxTokens: number;
  created_at: number;
  updated_at: number;
}

export class ContextManager {
  private contexts: Map<string, ConversationContext>;
  private messageHistory: Map<string, ClaudeMessage[]>;

  constructor() {
    this.contexts = new Map();
    this.messageHistory = new Map();
  }

  createContext(name: string, systemPrompt?: string): ConversationContext {
    const context: ConversationContext = {
      id: crypto.randomUUID(),
      name,
      systemPrompt,
      metadata: {},
      maxTokens: 4096,
      created_at: Date.now(),
      updated_at: Date.now(),
    };

    this.contexts.set(context.id, context);
    this.messageHistory.set(context.id, []);

    if (systemPrompt) {
      this.addMessage(context.id, {
        id: crypto.randomUUID(),
        role: 'system',
        content: systemPrompt,
        created_at: Date.now(),
      });
    }

    return context;
  }

  getContext(contextId: string): ConversationContext | undefined {
    return this.contexts.get(contextId);
  }

  getAllContexts(): ConversationContext[] {
    return Array.from(this.contexts.values());
  }

  updateContext(contextId: string, updates: Partial<ConversationContext>): void {
    const context = this.contexts.get(contextId);
    if (!context) throw new Error(`Context ${contextId} not found`);

    Object.assign(context, updates, { updated_at: Date.now() });
    this.contexts.set(contextId, context);
  }

  deleteContext(contextId: string): void {
    this.contexts.delete(contextId);
    this.messageHistory.delete(contextId);
  }

  getMessages(contextId: string): ClaudeMessage[] {
    return this.messageHistory.get(contextId) || [];
  }

  addMessage(contextId: string, message: ClaudeMessage): void {
    const messages = this.messageHistory.get(contextId) || [];
    messages.push(message);
    this.messageHistory.set(contextId, messages);
    
    const context = this.contexts.get(contextId);
    if (context) {
      context.updated_at = Date.now();
      this.contexts.set(contextId, context);
    }
  }

  clearMessages(contextId: string): void {
    const context = this.contexts.get(contextId);
    if (!context) throw new Error(`Context ${contextId} not found`);

    const systemMessage = this.messageHistory.get(contextId)?.find(m => m.role === 'system');
    this.messageHistory.set(contextId, systemMessage ? [systemMessage] : []);
  }

  exportContext(contextId: string): {
    context: ConversationContext;
    messages: ClaudeMessage[];
  } {
    const context = this.contexts.get(contextId);
    if (!context) throw new Error(`Context ${contextId} not found`);

    return {
      context,
      messages: this.getMessages(contextId),
    };
  }

  importContext(data: {
    context: ConversationContext;
    messages: ClaudeMessage[];
  }): void {
    this.contexts.set(data.context.id, data.context);
    this.messageHistory.set(data.context.id, data.messages);
  }
}