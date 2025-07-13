import { ClaudeMessage as IClaudeMessage } from '../lib/claude/types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ClaudeMessageProps {
  message: IClaudeMessage;
  isStreaming?: boolean;
}

export function ClaudeMessage({ message, isStreaming = false }: ClaudeMessageProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isUser
            ? 'bg-blue-500 text-white'
            : isAssistant
            ? 'bg-gray-200 text-gray-800'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        <div className="text-sm font-medium mb-1">
          {isUser ? 'You' : isAssistant ? 'Claude' : message.role}
        </div>
        <div className="text-sm">
          <MarkdownRenderer content={message.content} />
        </div>
        {isStreaming && (
          <div className="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-1"></div>
        )}
      </div>
    </div>
  );
}
