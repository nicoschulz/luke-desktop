export interface Chat {
  id: string;
  projectId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  attachments: Attachment[];
}

export interface ChatTemplate {
  id: string;
  name: string;
  description: string;
  initialMessage: string;
  createdAt: string;
}

export interface ChatSearchQuery {
  text?: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
  projectId?: string;
}

export interface ChatHistoryManager {
  createChat: (projectId: string, title: string) => Promise<string>;
  getChat: (chatId: string) => Promise<Chat>;
  updateChat: (chatId: string, updates: Partial<Chat>) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  
  addMessage: (chatId: string, content: string, role: 'user' | 'assistant', metadata?: any) => Promise<string>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  
  addAttachment: (messageId: string, file: File) => Promise<string>;
  removeAttachment: (attachmentId: string) => Promise<void>;
  
  addTag: (chatId: string, tag: string) => Promise<void>;
  removeTag: (chatId: string, tag: string) => Promise<void>;
  
  searchChats: (query: ChatSearchQuery) => Promise<Chat[]>;
  searchMessages: (query: string) => Promise<Message[]>;
  
  createTemplate: (template: Omit<ChatTemplate, 'id' | 'createdAt'>) => Promise<string>;
  getTemplates: () => Promise<ChatTemplate[]>;
  useTemplate: (templateId: string, projectId: string) => Promise<string>;
}
