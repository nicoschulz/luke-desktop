import React, { useState } from 'react';
import type { Message, Attachment } from '../../lib/types/chat';
import { useChat } from '../../hooks/useChat';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ChatHeader } from './ChatHeader';
import { AttachmentList } from './AttachmentList';

interface ChatWindowProps {
  chatId: string;
  projectId: string;
}

export function ChatWindow({ chatId, projectId }: ChatWindowProps) {
  const {
    chat,
    messages,
    attachments,
    loading,
    error,
    addMessage,
    editMessage,
    deleteMessage,
    addAttachment,
    addTag,
    removeTag,
    updateChat
  } = useChat(chatId);

  const [editingMessage, setEditingMessage] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Chat not found</div>
      </div>
    );
  }

  const handleSendMessage = async (content: string) => {
    await addMessage(content, 'user');
  };

  const handleEditMessage = async (messageId: string, content: string) => {
    await editMessage(messageId, content);
    setEditingMessage(null);
  };

  const handleFileUpload = async (file: File) => {
    const messageId = await addMessage('Uploaded file: ' + file.name, 'user');
    if (messageId) {
      await addAttachment(messageId, file);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ChatHeader
        title={chat.title}
        tags={chat.tags}
        onTitleChange={title => updateChat({ title })}
        onAddTag={addTag}
        onRemoveTag={removeTag}
      />
      
      <div className="flex-1 overflow-auto">
        <MessageList
          messages={messages}
          attachments={attachments}
          editingMessageId={editingMessage}
          onEditStart={setEditingMessage}
          onEditComplete={handleEditMessage}
          onDelete={deleteMessage}
        />
      </div>

      <div className="border-t border-gray-200 p-4">
        <MessageInput
          onSendMessage={handleSendMessage}
          onFileUpload={handleFileUpload}
        />
      </div>
    </div>
  );
}
