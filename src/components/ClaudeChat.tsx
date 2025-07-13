import { useState } from 'react';
import { useClaudeAI } from '../hooks/useClaudeAI';
import { useConversationAttachments } from '../hooks/useConversationAttachments';
import { useUsageTracking } from '../hooks/useTokenEstimation';
import FileAttachment from './FileAttachment';
import { ClaudeMessage } from './ClaudeMessage';
import { FileMetadata } from '../hooks/useFileAttachment';
import { ClaudeMessage as IClaudeMessage } from '../lib/claude/types';

interface ClaudeChatProps {
  apiKey: string;
  model?: string;
}

export function ClaudeChat({ apiKey, model = 'claude-3-opus-20240229' }: ClaudeChatProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<IClaudeMessage[]>([]);
  const [tempAttachments, setTempAttachments] = useState<FileMetadata[]>([]);

  const {
    attachments,
  } = useConversationAttachments('dummy-conversation-id');

  const {
    sendMessage,
  } = useClaudeAI({
    apiKey,
    model,
    organization: undefined
  });

  const { trackUsage } = useUsageTracking(model);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && tempAttachments.length === 0)) return;

    const messageContent = input;
    setInput('');

    try {
      const userMessage: IClaudeMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: messageContent,
        created_at: Date.now(),
      };
      setMessages(prev => [...prev, userMessage]);

      let assistantContent = '';
      await sendMessage(messageContent);
      assistantContent = 'Dummy response';

      const assistantMessage: IClaudeMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        created_at: Date.now(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      trackUsage([
        userMessage,
        assistantMessage
      ]);

      setTempAttachments([]);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="space-y-2">
            <ClaudeMessage message={message} />
            {message.attachments && message.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachments.filter(att => message.attachments?.some((a: any) => a.id === att.id)).map(att => (
                  <div key={att.id} className="text-sm text-gray-500">
                    {att.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FileAttachment
              projectId="dummy-project"
              chatId="dummy-chat"
              className="flex-shrink-0"
            />
            <button
              type="submit"
              className="px-6 py-2 rounded-lg text-white bg-blue-500 hover:bg-blue-600"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
