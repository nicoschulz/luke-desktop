export type MessageRole = 'user' | 'assistant' | 'system';

export type MessageAttachment = {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
};

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  attachments?: MessageAttachment[];
  metadata?: Record<string, unknown>;
  isStreaming?: boolean;
  error?: string;
}

export interface MessageAction {
  id: string;
  label: string;
  icon?: React.ComponentType;
  onClick: (message: Message) => void;
}

export interface MessageListProps {
  messages: Message[];
  onMessageAction?: (action: MessageAction, message: Message) => void;
  isLoading?: boolean;
  className?: string;
}