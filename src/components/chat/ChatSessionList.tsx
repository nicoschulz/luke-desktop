import React, { useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Loader2, Plus, Archive } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ChatSessionListProps {
  projectId?: number;
  className?: string;
}

export function ChatSessionList({ projectId, className = '' }: ChatSessionListProps) {
  const {
    sessions,
    currentSession,
    loading,
    error,
    loadSessions,
    createSession,
    archiveSession,
    setCurrentSession,
  } = useChat();

  useEffect(() => {
    loadSessions(projectId);
  }, [loadSessions, projectId]);

  const handleNewChat = async () => {
    try {
      await createSession('New Chat', projectId);
    } catch (err) {
      console.error('Failed to create new chat session:', err);
    }
  };

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Failed to load chat sessions: {error}
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="p-4">
        <Button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                currentSession?.id === session.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
              onClick={() => setCurrentSession(session)}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium truncate">{session.title}</h3>
                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    session.id && archiveSession(session.id);
                  }}
                >
                  <Archive className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm opacity-70">
                {formatDistanceToNow(new Date(session.updated_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}