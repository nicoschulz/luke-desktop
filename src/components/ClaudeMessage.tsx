import React from 'react';
import { ClaudeMessage as IClaudeMessage } from '../lib/claude/types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ClaudeMessageProps {
  message: IClaudeMessage;
  isStreaming?: boolean;
}

export function ClaudeMessage({ message, isStreaming = false }: ClaudeMessageProps) {
  const isAssistant = message.role === 'assistant';
  const isSystem = message.role === 'system';
  
  return (
    <div
      className={`flex flex-col ${
        isAssistant ? 'items-start' : 'items-end'
      } ${isStreaming ? 'opacity-70' : ''}`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          isAssistant
            ? 'bg-gray-100 dark:bg-gray-800'
            : isSystem
            ? 'bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700'
            : 'bg-blue-100 dark:bg-blue-900 text-right'
        }`}
      >
        {isSystem && (
          <div className="text-xs text-yellow-600 dark:text-yellow-400 mb-1">
            System Prompt
          </div>
        )}
        
        {message.attachments && message.attachments.length > 0 && (
          <div className="mb-2 space-y-2">
            {message.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400"
              >
                <span>📎</span>
                <span>{attachment.name}</span>
                {attachment.type.startsWith('image/') && (
                  <img 
                    src={URL.createObjectURL(new Blob([attachment.content], { type: attachment.type }))}
                    alt={attachment.name}
                    className="max-w-full h-auto rounded"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div className={`${isAssistant ? '' : 'text-right'}`}>
          <MarkdownRenderer
            content={message.content}
            className={`${
              isAssistant
                ? 'prose-gray'
                : isSystem
                ? 'prose-yellow'
                : 'prose-blue'
            }`}
          />
        </div>

        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {new Date(message.created_at).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
