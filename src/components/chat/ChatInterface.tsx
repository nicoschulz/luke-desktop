import React, { useEffect, useRef } from 'react';
import { useChat } from '../../hooks/useChat';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Loader2, Send } from 'lucide-react';
import { ChatMessage } from '../../types/chat';
import { cn } from '../../lib/utils';

interface ChatInterfaceProps {
  className?: string;
}

export function ChatInterface({ className = '' }: ChatInterfaceProps) {
  const {
    currentSession,
    messages,
    loading,
    sendMessage,
    loadMessages,
  } = useChat();

  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (currentSession?.id) {
      loadMessages(currentSession.id);
    }
  }, [currentSession?.id, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession?.id || !input.trim() || loading) return;

    try {
      await sendMessage(currentSession.id, input.trim(), 'user');
      setInput('');
      // Here you would typically trigger the AI response
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 mb-4">
          {messages.map((message: ChatMessage, index: number) => (
            <div
              key={message.id ?? index}
              className={cn(
                'flex flex-col max-w-[80%] rounded-lg p-4',
                message.role === 'user'
                  ? 'ml-auto bg-primary text-primary-foreground'
                  : 'bg-muted'
              )}
            >
              <div className="text-sm font-medium mb-1">
                {message.role === 'user' ? 'You' : 'Assistant'}
              </div>
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            rows={1}
            className="min-h-[44px] resize-none"
            disabled={!currentSession || loading}
          />
          <Button
            type="submit"
            disabled={!currentSession || !input.trim() || loading}
            className="flex-shrink-0"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}