import React, { useState, useRef, useEffect } from 'react';
import { useClaudeAI } from '../hooks/useClaudeAI';
import { useConversationContext } from '../hooks/useConversationContext';
import { useUsageTracking } from '../hooks/useTokenEstimation';
import { useConversationAttachments } from '../hooks/useConversationAttachments';
import { SystemPromptManager } from './SystemPromptManager';
import { TokenCounter } from './TokenCounter';
import { ClaudeMessage as IClaudeMessage, ClaudeAttachment } from '../lib/claude/types';
import { ClaudeMessage } from './ClaudeMessage';
import { MessageAttachments } from './chat/MessageAttachments';
import FileAttachment from './FileAttachment';
import { FileMetadata } from '../hooks/useFileAttachment';
import { PaperClipIcon } from 'lucide-react';

interface ClaudeChatProps {
  apiKey: string;
  model?: string;
  initialMessages?: IClaudeMessage[];
}

export function ClaudeChat({ apiKey, model = 'claude-3-opus-20240229', initialMessages = [] }: ClaudeChatProps) {
  const [input, setInput] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [tempAttachments, setTempAttachments] = useState<FileMetadata[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    currentContext,
    contexts,
    messages: contextMessages,
    addMessage,
  } = useConversationContext();

  const {
    attachments,
    isLoading: isLoadingAttachments,
    addAttachment,
    removeAttachment,
  } = useConversationAttachments(currentContext?.id || '');
  
  const {
    sendMessage,
    streamMessage,
    messages,
    isLoading,
    error
  } = useClaudeAI({
    apiKey,
    model
  });

  const { trackUsage } = useUsageTracking(model);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const handleAttach = async (metadata: FileMetadata) => {
    setTempAttachments(prev => [...prev, metadata]);
  };

  const handleRemoveAttachment = (id: string) => {
    setTempAttachments(prev => prev.filter(att => att.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && tempAttachments.length === 0) || isLoading) return;

    const messageContent = input;
    setInput('');
    setStreamingContent('');

    try {
      // Convert FileMetadata to ClaudeAttachment
      const claudeAttachments: ClaudeAttachment[] = await Promise.all(
        tempAttachments.map(async (att) => {
          const content = await window.fs.readFile(`attachments/${att.id}`);
          return {
            id: att.id,
            type: att.mime_type,
            name: att.name,
            content: new Uint8Array(content),
            metadata: {
              size: att.size,
              lastModified: att.created_at,
            },
          };
        })
      );

      // Add user message to context
      const userMessage: IClaudeMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: messageContent,
        created_at: Date.now(),
        attachments: claudeAttachments.length > 0 ? claudeAttachments : undefined,
      };
      addMessage(userMessage);

      // Add attachments to conversation
      for (const att of tempAttachments) {
        await addAttachment(att);
      }
      setTempAttachments([]); // Clear temporary attachments

      // Stream the assistant's response
      let assistantContent = '';
      await streamMessage(messageContent, (chunk) => {
        assistantContent += chunk;
        setStreamingContent(prev => prev + chunk);
      });

      // Add assistant message to context
      const assistantMessage: IClaudeMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: assistantContent,
        created_at: Date.now(),
      };
      addMessage(assistantMessage);

      // Track token usage
      trackUsage([userMessage, assistantMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleDownload = async (attachment: FileMetadata) => {
    // TODO: Implement file download
  };

  return (
    <div className="flex flex-col h-full">
      {currentContext ? (
        <>
          <div className="border-b p-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">{currentContext.name}</h2>
              <p className="text-sm text-gray-500">
                {currentContext.systemPrompt ? 'System prompt set' : 'No system prompt'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <TokenCounter messages={contextMessages} model={model} />
              </div>
              <button
                onClick={() => setShowSystemPrompt(true)}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Manage Context
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {contextMessages.map((message) => (
              <div key={message.id} className="space-y-2">
                <ClaudeMessage message={message} />
                {message.attachments && (
                  <MessageAttachments
                    attachments={attachments.filter(att => message.attachments?.some(a => a.id === att.id))}
                    onDownload={handleDownload}
                    className="mt-2"
                  />
                )}
              </div>
            ))}
            
            {streamingContent && (
              <ClaudeMessage
                message={{
                  id: 'streaming',
                  role: 'assistant',
                  content: streamingContent,
                  created_at: Date.now(),
                }}
                isStreaming={true}
              />
            )}
            
            {error && (
              <div className="text-red-500 text-center">
                Error: {error.message}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {tempAttachments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tempAttachments.map((attachment) => (
                    <div key={attachment.id} className="relative">
                      <FilePreview
                        metadata={attachment}
                        onDelete={() => handleRemoveAttachment(attachment.id)}
                        className="w-24 h-24"
                      />
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex space-x-4">
                <div className="flex-1 flex items-center space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <FileAttachment
                    projectId={currentContext.id}
                    chatId={currentContext.id}
                    onAttach={handleAttach}
                    onDelete={handleRemoveAttachment}
                    className="w-auto"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-6 py-2 rounded-lg text-white ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {isLoading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Welcome to Claude Chat</h2>
            <button
              onClick={() => setShowSystemPrompt(true)}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Create a New Context
            </button>
          </div>
        </div>
      )}

      {showSystemPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <SystemPromptManager onClose={() => setShowSystemPrompt(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
