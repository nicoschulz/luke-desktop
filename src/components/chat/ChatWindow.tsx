import { useChat } from '../../hooks/useChat';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ChatHeader } from './ChatHeader';

interface ChatWindowProps {
  chatId: string;
}

export function ChatWindow({ chatId }: ChatWindowProps) {
  const {
    chat,
    messages,
    loading,
    error,
    addMessage,
    addTag,
    removeTag,
    updateChat
  } = useChat(chatId);

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
        />
      </div>

      <div className="border-t border-gray-200 p-4">
        <MessageInput
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}
